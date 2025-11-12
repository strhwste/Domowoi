var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
/**
 * Simple fallback implementation for the Home Assistant entity combo box element.
 * When the real component is already registered by Home Assistant, this file
 * does nothing thanks to the existence check below.
 */
if (!customElements.get('ha-entity-combo-box')) {
    class HaEntityComboBox extends LitElement {
        constructor() {
            super(...arguments);
            this.disabled = false;
            this._filter = '';
            this._onFilterChange = (event) => {
                this._filter = event.target.value;
            };
            this._onSelectionChange = (event) => {
                const value = event.target.value || '';
                this.value = value || undefined;
                this.dispatchEvent(new CustomEvent('value-changed', {
                    detail: { value: this.value },
                    bubbles: true,
                    composed: true,
                }));
            };
        }
        render() {
            if (!this.hass?.states) {
                return nothing;
            }
            const entries = this._filterEntities();
            const filter = this._filter.trim().toLowerCase();
            const filteredEntries = filter
                ? entries.filter((entity) => this._matchesFilter(entity, filter))
                : entries;
            return html `
				<div class="combo-wrapper">
					${entries.length > 10
                ? html `<input
								class="search-input"
								type="search"
								placeholder="${this._localize('Search entity...')}"
								.value=${this._filter}
								?disabled=${this.disabled}
								@input=${this._onFilterChange}
							/>`
                : nothing}
					<select
						.value=${this.value ?? ''}
						?disabled=${this.disabled}
						@change=${this._onSelectionChange}
					>
						<option value="">${this._localize('None')}</option>
						${filteredEntries.map((entity) => {
                const name = entity.attributes?.friendly_name || entity.entity_id;
                return html `<option value=${entity.entity_id}>${name}</option>`;
            })}
					</select>
				</div>
			`;
        }
        _filterEntities() {
            const states = Object.values(this.hass?.states ?? {});
            const includeDomains = this.includeDomains?.length
                ? new Set(this.includeDomains)
                : undefined;
            return states
                .filter((entity) => {
                if (includeDomains) {
                    const domain = entity.entity_id.split('.')[0];
                    if (!includeDomains.has(domain)) {
                        return false;
                    }
                }
                if (!this.area) {
                    return true;
                }
                const entityArea = entity.attributes?.area_id ?? this._resolveAreaFromDevice(entity);
                return entityArea === this.area;
            })
                .sort((a, b) => {
                const nameA = a.attributes?.friendly_name || a.entity_id;
                const nameB = b.attributes?.friendly_name || b.entity_id;
                return nameA.localeCompare(nameB);
            });
        }
        _resolveAreaFromDevice(entity) {
            const deviceId = entity?.attributes?.device_id;
            if (!deviceId || !this.hass?.devices) {
                return undefined;
            }
            return this.hass.devices[deviceId]?.area_id;
        }
        _matchesFilter(entity, filter) {
            const id = entity.entity_id.toLowerCase();
            const name = (entity.attributes?.friendly_name || '').toLowerCase();
            return id.includes(filter) || name.includes(filter);
        }
        _localize(fallback) {
            return fallback;
        }
    }
    HaEntityComboBox.styles = css `
			:host {
				display: block;
				font-family: inherit;
			}
			.combo-wrapper {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
			}
			.search-input {
				padding: 0.25rem 0.5rem;
				font: inherit;
			}
			select {
				width: 100%;
				padding: 0.35rem 0.5rem;
				font: inherit;
				border-radius: 4px;
				border: 1px solid var(--divider-color, #ccc);
				background: var(--card-background-color, #fff);
				color: inherit;
			}
			select:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
			option {
				color: initial;
			}
		`;
    __decorate([
        property({ attribute: false })
    ], HaEntityComboBox.prototype, "hass", void 0);
    __decorate([
        property({ type: String })
    ], HaEntityComboBox.prototype, "value", void 0);
    __decorate([
        property({ attribute: false })
    ], HaEntityComboBox.prototype, "includeDomains", void 0);
    __decorate([
        property({ type: String })
    ], HaEntityComboBox.prototype, "area", void 0);
    __decorate([
        property({ type: Boolean })
    ], HaEntityComboBox.prototype, "disabled", void 0);
    __decorate([
        state()
    ], HaEntityComboBox.prototype, "_filter", void 0);
    customElements.define('ha-entity-combo-box', HaEntityComboBox);
}
//# sourceMappingURL=ha-entity-combo-box.js.map