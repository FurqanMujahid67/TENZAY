import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'theonlykingonearthisasad/testlaoding',
		loadComponent: () => import('../pages/private-json/private-json').then((m) => m.PrivateJson),
	},
];
