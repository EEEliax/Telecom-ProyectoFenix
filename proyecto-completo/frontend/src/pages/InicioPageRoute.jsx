import { useOutletContext } from 'react-router-dom';
import InicioPage from './InicioPage';

export default function InicioPageRoute() {
  const { userEmail } = useOutletContext();
  return <InicioPage userEmail={userEmail} />;
}
