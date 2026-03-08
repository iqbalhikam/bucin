import { getSiteConfig, getThemeConfig, getAllMusic, getMemories } from '@/app/actions';
import AdminPage from '@/components/admin/AdminPage';

export default async function Page() {
  // Add auth check here if needed (e.g., middleware or session check)

  const siteConfig = await getSiteConfig();
  const themeConfig = await getThemeConfig();
  const allMusic = await getAllMusic();
  const memories = await getMemories();

  return <AdminPage siteConfig={siteConfig} themeConfig={themeConfig} allMusic={allMusic} memories={memories} />;
}
