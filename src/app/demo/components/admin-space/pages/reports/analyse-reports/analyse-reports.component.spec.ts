import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseReportsComponent } from './analyse-reports.component';

describe('AnalyseReportsComponent', () => {
  let component: AnalyseReportsComponent;
  let fixture: ComponentFixture<AnalyseReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyseReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyseReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
