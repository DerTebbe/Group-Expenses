import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCreatePage } from './group-create.page';

describe('GroupCreatePage', () => {
  let component: GroupCreatePage;
  let fixture: ComponentFixture<GroupCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCreatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
