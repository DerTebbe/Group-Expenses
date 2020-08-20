import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Group} from '../../models/GroupModel';
import {Router} from '@angular/router';
import {AlertController, IonSearchbar, Platform} from '@ionic/angular';
import {GroupService} from '../../services/group.service';
import {UserServiceService} from '../../services/user-service.service';
import {PushnService} from "../../services/pushn.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-group-list',
    templateUrl: './group-list.page.html',
    styleUrls: ['./group-list.page.scss'],
})
export class GroupListPage implements OnInit, OnDestroy {

    @ViewChild('searchbar')
    private searchbar: IonSearchbar;

    public groups: Group[] = [];
    filteredGroups: Group[] = [];
    isSearchMode = false;
    showSearchbar = false;
    searchIsEmpty = false;
    user: any;
    subs: Subscription[] = [];

    /**
     * @desc Inject the objects needed and gets information about the logged in user
     * @param platform
     * @param alertcontroller Show alert windows
     * @param service Fetch group data from Firebase
     * @param router Navigate in the app
     * @param userservice Fetch user data from Firebase
     * @param groupservice Fetch group data from Firebase
     * @param ngZone
     */
    constructor(
        private platform: Platform,
        private alertcontroller: AlertController,
        private service: GroupService,
        private router: Router,
        private userservice: UserServiceService,
        private groupservice: GroupService,
        private ngZone: NgZone,
    ) {
        this.checkImages();
        this.userservice.getUser().then(value => {
            this.user = value;
        })
    }

    /**
     * @desc Method for searching in the groups[]
     * @param event
     */
    search(event) {
        const input: string = event.target.value;
        this.filteredGroups = this.groups.filter(group => group.name.toLowerCase().includes(input.toLowerCase()));
        this.isSearchMode = input.length !== 0;
        this.searchIsEmpty = this.filteredGroups.length === 0;
    }

    openSearchbar() {
        this.showSearchbar = true;
        setTimeout(() => {
            this.searchbar.setFocus();
        }, 50);
    }

     openMaps(){
         this.router.navigate(['maps']);
     }

    /**
     * @desc Navigates to GroupCreate page
     */
    createGroup() {
        this.router.navigate(['group-create']);
    }

    /**
     * @desc Navigates to ProfileDetail page
     */
    openProfile() {
      this.ngZone.run( () =>  this.router.navigate(['profile-detail', {userid: this.user.uid}]));
    }

    /**
     * @desc Navigates to the InvoiceList page
     * @param id UID of the group to be navigated into
     */

    openGroup(id: string) {
        this.router.navigate(['invoice-list', {groupID: id}]);
    }

    public ionViewDidEnter() {
        this.checkImages();
        this.isSearchMode = false;
        this.showSearchbar = false;
        this.checkUsername();
    }


    /**
     * @desc Checks if a group has a group picture if not shows a default picture
     */
    checkImages() {
        for (const group of this.groups) {
            group.bildLink = group.bildLink ? group.bildLink : '../../../assets/img/avatar.png';
        }
    }

    ngOnInit(): void {
        this.groupservice.showUserGroups().then((value) => {
            this.subs.push(value.subscribe(
                group => {
                    this.groups = group;
                    this.service.group = group;
                    this.checkImages();
                }));
        });
    }

    /**
     * @desc Guides user to ProfileDetailPage after first login to choose a username
     */
    checkUsername(){
        this.userservice.getUser().then(value => {
            this.subs.push(this.userservice.findbyId(value.uid).subscribe(user => {
                if (user.name === null){
                    this.alertWindow("Du hast noch keinen Usernamen, bitte lege ihn jetzt an")
                }
            }))
        })
    }

    /**
     * @desc Alert window showed if no username has been chosen yet
     * @param message Message displayed in the alert window
     */

    async alertWindow(message: string) {
        const alert = await this.alertcontroller.create({
            message,
            buttons: [{
                text: 'OK',
                handler: () => {
                    this.router.navigate(['profile-detail', {userid: this.user.uid, id: '1'}]);
                }
            }],
            backdropDismiss: false,
        });
        await alert.present();
    }

    ngOnDestroy(): void {
        for (let sub of this.subs) {
            if (sub) {
                sub.unsubscribe();
            }
        }
    }
}
