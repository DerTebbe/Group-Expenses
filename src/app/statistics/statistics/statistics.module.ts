import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StatisticsPage } from './statistics.page';
import {Ng2GoogleChartsModule} from 'ng2-google-charts';

const routes: Routes = [
  {
    path: '',
    component: StatisticsPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        Ng2GoogleChartsModule
    ],
  declarations: [StatisticsPage]
})
export class StatisticsPageModule {}
