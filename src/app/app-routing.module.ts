import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: 'register', loadChildren: './access/register/register.module#RegisterPageModule' },
  { path: 'login', loadChildren: './access/login/login.module#LoginPageModule' },
  { path: 'group-list', loadChildren: './groups/group-list/group-list.module#GroupListPageModule' },
  { path: 'group-create', loadChildren: './groups/group-create/group-create.module#GroupCreatePageModule' },
  { path: 'profile-detail', loadChildren: './profile/profile-detail/profile-detail.module#ProfileDetailPageModule' },
  { path: 'loading', loadChildren: './access/loading/loading.module#LoadingPageModule' },
  { path: 'invoice-detail', loadChildren: './invoice/invoice-detail/invoice-detail.module#InvoiceDetailPageModule' },
  { path: 'invoice-list', loadChildren: './invoice/invoice-list/invoice-list.module#RechnungListPageModule' },
  { path: 'group-detail', loadChildren: './groups/group-detail/group-detail.module#GroupDetailPageModule' },
  { path: 'personal-balances', loadChildren: './balances/personal-balances/personal-balances.module#PersonalBalancesPageModule' },
  { path: 'statistics/:id', loadChildren: './statistics/statistics/statistics.module#StatisticsPageModule' },
  { path: 'invoice-picker', loadChildren: './invoice/invoice-picker/invoice-picker.module#InvoicePickerPageModule' },  { path: 'maps', loadChildren: './maps/maps/maps.module#MapsPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
