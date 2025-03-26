import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableReconciliationComponent } from './table-reconciliation.component';

describe('TableReconciliationComponent', () => {
  let component: TableReconciliationComponent;
  let fixture: ComponentFixture<TableReconciliationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableReconciliationComponent]
    });
    fixture = TestBed.createComponent(TableReconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
