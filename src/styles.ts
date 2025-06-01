import { css } from 'lit';

export const styles = [
  css`
:host {
  display: block;
  background: var(--ha-card-background, var(--card-background-color, #fff));
  border-radius: var(--ha-card-border-radius, 1em);
  box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.07));
  padding: 1.5em;
  font-family: var(--primary-font-family, inherit);
  color: var(--primary-text-color, #222);
}

h2 {
  margin-top: 0;
  font-size: 1.3em;
  color: var(--primary-text-color, #4a4a4a);
}

p.warning {
  color: var(--warning-color, #b85c00);
  background: var(--warning-bg, #fff7e6);
  border-left: 4px solid var(--warning-border, #ffb300);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

p.info {
  color: var(--info-color, #0288d1);
  background: var(--info-bg, #e6f4ff);
  border-left: 4px solid var(--info-border, #2196f3);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

p.ok {
  color: var(--success-color, #357a38);
  background: var(--success-bg, #e6f9e6);
  border-left: 4px solid var(--success-border, #4caf50);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

.debug {
  font-size: 0.9em;
  color: var(--secondary-text-color, #888);
  background: var(--secondary-background-color, #f5f5f5);
  border-radius: 0.5em;
  padding: 0.5em 1em;
  margin: 0.5em 0;
  white-space: pre-wrap;
  }
  `,
  css`
    .warnbox {
      border-radius: 6px;
      padding: 0.7em 1em;
      margin: 0.5em 0;
      font-weight: 500;
      box-shadow: 0 2px 8px #0001;
      border-left: 6px solid;
      background: #f8f8f8;
    }
    .warnbox.alert {
      border-color: #d32f2f;
      background: #ffeaea;
      color: #b71c1c;
    }
    .warnbox.warn {
      border-color: #fbc02d;
      background: #fff8e1;
      color: #b28704;
    }
    .warnbox.info {
      border-color: #1976d2;
      background: #e3f2fd;
      color: #0d47a1;
    }
    .warnbox.ok {
      border-color: #388e3c;
      background: #e8f5e9;
      color: #1b5e20;
    }
  `
];
