import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconciliationDetailsGraphComponent } from './reconciliation-details-graph.component';

describe('ReconciliationDetailsGraphComponent', () => {
  let component: ReconciliationDetailsGraphComponent;
  let fixture: ComponentFixture<ReconciliationDetailsGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReconciliationDetailsGraphComponent]
    });
    fixture = TestBed.createComponent(ReconciliationDetailsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
