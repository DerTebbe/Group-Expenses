import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBalancesPage } from './group-balances.page';

describe('GroupBalancesPage', () => {
  let component: GroupBalancesPage;
  let fixture: ComponentFixture<GroupBalancesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupBalancesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupBalancesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
