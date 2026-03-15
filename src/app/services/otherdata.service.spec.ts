import { TestBed } from '@angular/core/testing';

import { OtherdataService } from './otherdata.service';

describe('OtherdataService', () => {
  let service: OtherdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
