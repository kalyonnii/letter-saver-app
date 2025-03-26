import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewletterComponent } from './viewletter.component';

describe('ViewletterComponent', () => {
  let component: ViewletterComponent;
  let fixture: ComponentFixture<ViewletterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewletterComponent]
    });
    fixture = TestBed.createComponent(ViewletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
