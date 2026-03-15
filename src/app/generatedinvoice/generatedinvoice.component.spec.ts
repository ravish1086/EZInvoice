import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedinvoiceComponent } from './generatedinvoice.component';

describe('GeneratedinvoiceComponent', () => {
  let component: GeneratedinvoiceComponent;
  let fixture: ComponentFixture<GeneratedinvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratedinvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratedinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
