import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HsnsummaryComponent } from './hsnsummary.component';

describe('HsnsummaryComponent', () => {
  let component: HsnsummaryComponent;
  let fixture: ComponentFixture<HsnsummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HsnsummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HsnsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
