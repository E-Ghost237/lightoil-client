import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HbtGraphComponent } from './hbt-graph.component';

describe('HbtGraphComponent', () => {
  let component: HbtGraphComponent;
  let fixture: ComponentFixture<HbtGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HbtGraphComponent]
    });
    fixture = TestBed.createComponent(HbtGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
