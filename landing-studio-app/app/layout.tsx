import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Landing Studio · Créez vos campagnes produit',description:'Du produit à la landing page. Génération, commandes, analytics et publication GitHub.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
