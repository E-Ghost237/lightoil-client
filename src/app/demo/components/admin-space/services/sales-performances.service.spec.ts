import { TestBed } from '@angular/core/testing';

import { SalesPerformancesService } from '../services/sales-performances.service';

describe('SalesPerformancesService', () => {
  let service: SalesPerformancesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesPerformancesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
