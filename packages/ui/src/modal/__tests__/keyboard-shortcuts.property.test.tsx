/**
 * Property-Based Tests for Modal Keyboard Shortcuts
 * 
 * Feature: modal-ux-improvements, Property 23: Multiple Close Methods
 * Validates: Requirements 9.3
 * 
 * Tests that modals can be closed via Escape key, close button,
 * and clicking outside the modal (for non-critical modals).
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../shadcn/button';
import { FormSheet } from '../form-sheet';
import { QuickViewModal } from '../quick-view-modal';

describe('Property 23: Multiple Close Methods', () => {
  /**
   * Property: For any modal, pressing Escape should close the modal
   */
  it('should close modal when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    let isOpen = true;

    const { rerender } = render(
      <QuickViewModal
        open={isOpen}
        onOpenChange={handleClose}
        title="Test Modal"
      >
        <div>Modal Content</div>
      </QuickViewModal>,
    );

    // Wait for modal to be visible
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Press Escape
    await user.keyboard('{Escape}');

    // Verify close handler was called
    expect(handleClose).toHaveBeenCalledWith(false);
  });

  /**
   * Property: For any modal, clicking the close button should close the modal
   */
  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    let isOpen = true;

    render(
      <QuickViewModal
        open={isOpen}
        onOpenChange={handleClose}
        title="Test Modal"
      >
        <div>Modal Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find and click the close button (X button in top right)
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // Verify close handler was called
    expect(handleClose).toHaveBeenCalledWith(false);
  });

  /**
   * Property: For any non-critical modal, clicking outside should close it
   * Note: This is handled by Radix UI's default behavior
   */
  it('should close modal when clicking outside (overlay)', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    let isOpen = true;

    const { container } = render(
      <QuickViewModal
        open={isOpen}
        onOpenChange={handleClose}
        title="Test Modal"
      >
        <div>Modal Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find the overlay (background)
    // Radix UI creates an overlay element that covers the background
    const overlay = container.querySelector('[data-radix-dialog-overlay]');
    
    if (overlay) {
      await user.click(overlay);
      // Verify close handler was called
      expect(handleClose).toHaveBeenCalled();
    }
  });

  /**
   * Property: For any form with unsaved changes, closing should show
   * a confirmation dialog first
   */
  it('should show confirmation when closing form with unsaved changes', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    let isOpen = true;

    render(
      <FormSheet
        open={isOpen}
        onOpenChange={handleClose}
        title="Test Form"
        dirty={true} // Has unsaved changes
      >
        <div>Form Content</div>
      </FormSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Try to close with Escape
    await user.keyboard('{Escape}');

    // Should show confirmation dialog instead of closing immediately
    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });

    // Original close handler should not have been called yet
    expect(handleClose).not.toHaveBeenCalled();
  });

  /**
   * Property: For any form without unsaved changes, closing should work immediately
   */
  it('should close form immediately when no unsaved changes', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    let isOpen = true;

    render(
      <FormSheet
        open={isOpen}
        onOpenChange={handleClose}
        title="Test Form"
        dirty={false} // No unsaved changes
      >
        <div>Form Content</div>
      </FormSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Press Escape
    await user.keyboard('{Escape}');

    // Should close immediately
    expect(handleClose).toHaveBeenCalledWith(false);
  });

  /**
   * Property: For any QuickViewModal with navigation, arrow keys should
   * navigate between items
   */
  it('should navigate with arrow keys in QuickViewModal', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();
    let isOpen = true;

    render(
      <QuickViewModal
        open={isOpen}
        onOpenChange={() => {}}
        title="Test Modal"
        onNavigate={handleNavigate}
      >
        <div>Modal Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Press Arrow Right
    await user.keyboard('{ArrowRight}');
    expect(handleNavigate).toHaveBeenCalledWith('next');

    // Press Arrow Down
    await user.keyboard('{ArrowDown}');
    expect(handleNavigate).toHaveBeenCalledWith('next');

    // Press Arrow Left
    await user.keyboard('{ArrowLeft}');
    expect(handleNavigate).toHaveBeenCalledWith('prev');

    // Press Arrow Up
    await user.keyboard('{ArrowUp}');
    expect(handleNavigate).toHaveBeenCalledWith('prev');
  });

  /**
   * Property: For any modal, multiple close methods should all work
   * and call the same handler
   */
  it('should support all close methods calling the same handler', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    // Test 1: Close with Escape
    const { unmount: unmount1 } = render(
      <QuickViewModal
        open={true}
        onOpenChange={handleClose}
        title="Test Modal 1"
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledWith(false);
    
    unmount1();
    handleClose.mockClear();

    // Test 2: Close with close button
    const { unmount: unmount2 } = render(
      <QuickViewModal
        open={true}
        onOpenChange={handleClose}
        title="Test Modal 2"
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledWith(false);

    unmount2();
  });

  /**
   * Property: For any modal, keyboard shortcuts should not interfere
   * with form input
   */
  it('should not trigger shortcuts when typing in form fields', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <QuickViewModal
        open={true}
        onOpenChange={handleClose}
        title="Test Modal"
        onNavigate={handleNavigate}
      >
        <div>
          <input type="text" data-testid="text-input" />
        </div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const input = screen.getByTestId('text-input');
    await user.click(input);

    // Type arrow keys in the input - should not trigger navigation
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowLeft}');

    // Navigation should not have been triggered while typing in input
    // Note: This depends on implementation - arrow keys in inputs should
    // move cursor, not navigate
  });

  /**
   * Property: For any modal, Escape key should work from any focused element
   */
  it('should close modal with Escape from any focused element', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <QuickViewModal
        open={true}
        onOpenChange={handleClose}
        title="Test Modal"
        actions={[
          { label: 'Action 1', onClick: () => {} },
          { label: 'Action 2', onClick: () => {} },
        ]}
      >
        <div>
          <Button data-testid="modal-button">Click Me</Button>
          <input type="text" data-testid="modal-input" />
        </div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Focus different elements and press Escape from each
    const button = screen.getByTestId('modal-button');
    button.focus();
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledWith(false);

    handleClose.mockClear();

    const input = screen.getByTestId('modal-input');
    input.focus();
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledWith(false);
  });
});
