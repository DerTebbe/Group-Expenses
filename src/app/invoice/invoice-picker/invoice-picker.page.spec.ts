import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePickerPage } from './invoice-picker.page';

describe('InvoicePickerPage', () => {
  let component: InvoicePickerPage;
  let fixture: ComponentFixture<InvoicePickerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicePickerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePickerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
