import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalBalancesPage } from './personal-balances.page';

describe('PersonalBalancesPage', () => {
  let component: PersonalBalancesPage;
  let fixture: ComponentFixture<PersonalBalancesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalBalancesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalBalancesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
