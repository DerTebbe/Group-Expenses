import { TestBed } from '@angular/core/testing';

import { PushnService } from './pushn.service';

describe('PushnService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PushnService = TestBed.get(PushnService);
    expect(service).toBeTruthy();
  });
});
