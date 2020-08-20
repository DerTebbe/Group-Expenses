import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDetailPage } from './group-detail.page';

describe('GroupDetailPage', () => {
  let component: GroupDetailPage;
  let fixture: ComponentFixture<GroupDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
