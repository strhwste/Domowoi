import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('hausgeist-card-editor')
export class HausgeistCardEditor extends LitElement {
  @property({ type: Object }) config: { debug?: boolean } = {};

  setConfig(config: any) {
    this.config = config;
  }

  // Use arrow function to auto-bind 'this'
  _onDebugChange = (e: Event) => {
    const debug = (e.target as HTMLInputElement).checked;
    this.config = { ...this.config, debug };
    this._configChanged();
  };

  _configChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="card-config">
        <label>
          <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
          Debug mode
        </label>
      </div>
    `;
  }
}
