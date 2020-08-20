import {NgModule, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {Group} from '../../models/GroupModel';
import {IonicModule} from '@ionic/angular';
import {GroupListPage} from './group-list.page';
import {GroupService} from '../../services/group.service';

const routes: Routes = [
    {
        path: '',
        component: GroupListPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [GroupListPage]
})
export class GroupListPageModule {
}



