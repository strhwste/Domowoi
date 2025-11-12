import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * Simple fallback implementation for the Home Assistant entity combo box element.
 * When the real component is already registered by Home Assistant, this file
 * does nothing thanks to the existence check below.
 */
if (!customElements.get('ha-entity-combo-box')) {
	class HaEntityComboBox extends LitElement {
		@property({ attribute: false }) hass: any;
		@property({ type: String }) value: string | undefined;
		@property({ attribute: false }) includeDomains: string[] | undefined;
		@property({ type: String }) area: string | undefined;
		@property({ type: Boolean }) disabled = false;
		@state() private _filter = '';

		static styles = css`
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

		protected render() {
			if (!this.hass?.states) {
				return nothing;
			}

			const entries = this._filterEntities();
			const filter = this._filter.trim().toLowerCase();
			const filteredEntries = filter
				? entries.filter((entity) => this._matchesFilter(entity, filter))
				: entries;

			return html`
				<div class="combo-wrapper">
					${entries.length > 10
						? html`<input
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
							return html`<option value=${entity.entity_id}>${name}</option>`;
						})}
					</select>
				</div>
			`;
		}

		private _filterEntities(): any[] {
			const states = Object.values(this.hass?.states ?? {});
			const includeDomains = this.includeDomains?.length
				? new Set(this.includeDomains)
				: undefined;

			return states
				.filter((entity: any) => {
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
				.sort((a: any, b: any) => {
					const nameA = a.attributes?.friendly_name || a.entity_id;
					const nameB = b.attributes?.friendly_name || b.entity_id;
					return nameA.localeCompare(nameB);
				});
		}

		private _resolveAreaFromDevice(entity: any): string | undefined {
			const deviceId = entity?.attributes?.device_id;
			if (!deviceId || !this.hass?.devices) {
				return undefined;
			}
			return this.hass.devices[deviceId]?.area_id;
		}

		private _matchesFilter(entity: any, filter: string): boolean {
			const id = entity.entity_id.toLowerCase();
			const name = (entity.attributes?.friendly_name || '').toLowerCase();
			return id.includes(filter) || name.includes(filter);
		}

		private _onFilterChange = (event: Event) => {
			this._filter = (event.target as HTMLInputElement).value;
		};

		private _onSelectionChange = (event: Event) => {
			const value = (event.target as HTMLSelectElement).value || '';
			this.value = value || undefined;
			this.dispatchEvent(
				new CustomEvent('value-changed', {
					detail: { value: this.value },
					bubbles: true,
					composed: true,
				}),
			);
		};

			private _localize(fallback: string): string {
				return fallback;
			}
	}

	customElements.define('ha-entity-combo-box', HaEntityComboBox);
}
