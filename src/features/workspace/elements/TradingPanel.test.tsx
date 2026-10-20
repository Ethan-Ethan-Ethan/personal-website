// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TradingPanel from './TradingPanel';

afterEach(() => cleanup());

describe('TradingPanel', () => {
  it('shows disclaimer and BTC observation when open', () => {
    render(<TradingPanel open />);
    expect(screen.getByTestId('trading-disclaimer').textContent).toMatch(/非投資建議/);
    expect(screen.getByText(/本根偏向/)).toBeTruthy();
  });

  it('switches to TXF pending copy', async () => {
    const user = userEvent.setup();
    render(<TradingPanel open />);
    await user.click(screen.getByRole('tab', { name: '台指期' }));
    expect(screen.getByText(/整備中/)).toBeTruthy();
  });

  it('does not mount TV host when closed', () => {
    render(<TradingPanel open={false} />);
    expect(screen.queryByTestId('tradingview-host')).toBeNull();
  });
});
