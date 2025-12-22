import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  imports: [],
  template: `
    <div style="padding: 2rem; text-align: center;">
      <h1>Test Component</h1>
      <p>Si ves esto, el routing funciona correctamente.</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--bg-primary);
    }
  `],
})
export class TestComponent {}
