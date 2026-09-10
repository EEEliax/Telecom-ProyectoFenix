'use strict';

/**
 * GET /api/dashboard/inicio
 *
 * Devuelve internetService (DSL/Fiber optic/No) y monthlyCharges real.
 *
 * Requirements:
 *   - 1.1: internetService real desde cliente_servicios_pivot + servicios_catalogo
 *   - 1.2: monthlyCharges real desde cuentas_contrataciones
 *   - 1.3: Resto sigue mockeado en frontend
 */
async function getInicio(req, res) {
  try {
    const customer_id = req.user.customer_id;
    const pool = req.app.locals.pool;

    // Query para internetService
    const internetQuery = await pool.query(
      `SELECT csp.estado_servicio
       FROM cliente_servicios_pivot csp
       JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
       JOIN cuentas_contrataciones cc ON cc.customer_id = csp.customer_id
       WHERE csp.customer_id = $1 AND sc.nombre_servicio = 'InternetService'`,
      [customer_id]
    );

    const internetService = internetQuery.rows.length > 0 
      ? internetQuery.rows[0].estado_servicio 
      : 'No';

    // Query para monthlyCharges
    const chargesQuery = await pool.query(
      `SELECT monthly_charges 
       FROM cuentas_contrataciones 
       WHERE customer_id = $1`,
      [customer_id]
    );

    const monthlyCharges = chargesQuery.rows.length > 0 
      ? chargesQuery.rows[0].monthly_charges 
      : 0;

    return res.status(200).json({
      internetService,
      monthlyCharges,
    });

  } catch (error) {
    console.error('[dashboard.controller] Error en getInicio:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * GET /api/facturacion
 *
 * Devuelve servicios activos, monthlyCharges, contractType, paymentMethod.
 *
 * Requirements:
 *   - 2.1: Lista de servicios activos (filtrado en JS, no por 'Activo')
 *   - 2.2: monthlyCharges real
 *   - 2.3: contractType real
 *   - 2.4: paymentMethod real
 *   - 2.5: Historial de facturas sigue mockeado
 */
async function getFacturacion(req, res) {
  try {
    const customer_id = req.user.customer_id;
    const pool = req.app.locals.pool;

    // Query para todos los servicios del cliente
    const servicesQuery = await pool.query(
      `SELECT sc.nombre_servicio, csp.estado_servicio
       FROM cliente_servicios_pivot csp
       JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
       WHERE csp.customer_id = $1`,
      [customer_id]
    );

    // Query para totales + contrato + pago
    const billingQuery = await pool.query(
      `SELECT cc.monthly_charges, tc.descripcion AS contract_type, mp.descripcion AS payment_method
       FROM cuentas_contrataciones cc
       JOIN tipos_contrato tc ON cc.tipo_contrato_id = tc.id
       JOIN metodos_pago mp ON cc.metodo_pago_id = mp.id
       WHERE cc.customer_id = $1`,
      [customer_id]
    );

    // Filtrar servicios activos en JS (según design.md corregido)
    const activeServices = [];
    const serviceMapping = {
      'InternetService': 'Internet Fibra Óptica',
      'PhoneService': 'Teléfono',
      'OnlineSecurity': 'Seguridad Online',
      'OnlineBackup': 'Backup Online',
      'DeviceProtection': 'Protección de Dispositivos',
      'TechSupport': 'Soporte Técnico',
      'StreamingTV': 'Streaming TV',
      'StreamingMovies': 'Streaming Películas',
      'MultipleLines': 'Líneas Múltiples',
    };

    for (const service of servicesQuery.rows) {
      const serviceName = service.nombre_servicio;
      const serviceStatus = service.estado_servicio;

      // Lógica de "activo" según design.md corregido
      let isActive = false;
      if (serviceName === 'InternetService') {
        isActive = serviceStatus !== 'No';
      } else {
        isActive = serviceStatus === 'Yes';
      }

      if (isActive && serviceMapping[serviceName]) {
        activeServices.push(serviceMapping[serviceName]);
      }
    }

    const monthlyCharges = billingQuery.rows.length > 0 
      ? billingQuery.rows[0].monthly_charges 
      : 0;
    const contractType = billingQuery.rows.length > 0 
      ? billingQuery.rows[0].contract_type 
      : 'No disponible';
    const paymentMethod = billingQuery.rows.length > 0 
      ? billingQuery.rows[0].payment_method 
      : 'No disponible';

    return res.status(200).json({
      activeServices,
      monthlyCharges,
      contractType,
      paymentMethod,
    });

  } catch (error) {
    console.error('[dashboard.controller] Error en getFacturacion:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * GET /api/servicios
 *
 * Devuelve estado real de servicios agrupados (Internet con sub-servicios, Teléfono con sub-servicios).
 *
 * Requirements:
 *   - 3.1: Estado real de cada servicio, agrupado como en frontend
 *   - 3.2: Si categoría padre no está contratada, indicar explícitamente activo: false
 */
async function getServicios(req, res) {
  try {
    const customer_id = req.user.customer_id;
    const pool = req.app.locals.pool;

    // Query para todos los servicios del cliente
    const servicesQuery = await pool.query(
      `SELECT sc.nombre_servicio, csp.estado_servicio
       FROM cliente_servicios_pivot csp
       JOIN servicios_catalogo sc ON csp.servicio_id = sc.id
       WHERE csp.customer_id = $1`,
      [customer_id]
    );

    // Mapear servicios a estructura jerárquica
    const servicesMap = {};
    for (const service of servicesQuery.rows) {
      servicesMap[service.nombre_servicio] = service.estado_servicio;
    }

    // Construir respuesta según design.md
    const internetService = servicesMap['InternetService'] || 'No';
    const phoneService = servicesMap['PhoneService'] || 'No';

    const response = {
      internet: {
        active: internetService !== 'No',
        type: internetService,
        subServices: {
          onlineSecurity: servicesMap['OnlineSecurity'] === 'Yes',
          onlineBackup: servicesMap['OnlineBackup'] === 'Yes',
          deviceProtection: servicesMap['DeviceProtection'] === 'Yes',
          techSupport: servicesMap['TechSupport'] === 'Yes',
          streamingTV: servicesMap['StreamingTV'] === 'Yes',
          streamingMovies: servicesMap['StreamingMovies'] === 'Yes',
        },
      },
      phone: {
        active: phoneService === 'Yes',
        subServices: {
          multipleLines: servicesMap['MultipleLines'] === 'Yes',
        },
      },
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('[dashboard.controller] Error en getServicios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * GET /api/tickets/history
 *
 * Devuelve todos los tickets del cliente logueado.
 *
 * Requirements:
 *   - 4.1: Resolver cadena customer_id → crm_contactos → sesiones_chat → tickets_soporte
 *   - 4.2: Devolver fecha_creacion, tipo_ticket, descripcion_problema, estado_ticket
 *   - 4.3: Ordenar por fecha_creacion descendente
 *   - 4.4: No exponer prioridad, nivel_enojo_detectado, probabilidad_churn_ml
 */
async function getTicketsHistory(req, res) {
  try {
    const customer_id = req.user.customer_id;
    const pool = req.app.locals.pool;

    // Query con join de 3 tablas según design.md
    const ticketsQuery = await pool.query(
      `SELECT t.fecha_creacion, t.tipo_ticket, t.descripcion_problema, t.estado_ticket
       FROM tickets_soporte t
       JOIN sesiones_chat s ON t.sesion_id = s.id
       JOIN crm_contactos c ON s.contacto_id = c.id
       WHERE c.customer_id = $1
       ORDER BY t.fecha_creacion DESC`,
      [customer_id]
    );

    return res.status(200).json({
      tickets: ticketsQuery.rows,
    });

  } catch (error) {
    console.error('[dashboard.controller] Error en getTicketsHistory:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = {
  getInicio,
  getFacturacion,
  getServicios,
  getTicketsHistory,
};