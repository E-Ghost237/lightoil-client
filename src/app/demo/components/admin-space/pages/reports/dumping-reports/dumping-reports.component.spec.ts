import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DumpingReportsComponent } from './dumping-reports.component';

describe('DumpingReportsComponent', () => {
  let component: DumpingReportsComponent;
  let fixture: ComponentFixture<DumpingReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DumpingReportsComponent]
    });
    fixture = TestBed.createComponent(DumpingReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
