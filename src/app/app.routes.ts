import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { ShopDetails } from './pages/shop-details/shop-details';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'shop',
    component: Shop,
  },
  {
    path: 'shop-details/:idOrUuid',
    component: ShopDetails,
  },
  {
    path: 'about',
    component: About,
  },
  {
    path: 'contact',
    component: Contact,
  },
];
