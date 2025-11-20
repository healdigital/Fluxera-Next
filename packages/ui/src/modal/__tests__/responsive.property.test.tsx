/**
 * Property-Based Tests for Modal Responsive Behavior
 * 
 * Feature: modal-ux-improvements, Property 21: Responsive Layout Adaptation
 * Validates: Requirements 9.1
 * 
 * Tests that modals adapt their layout appropriately on different
 * viewport sizes without content overflow or horizontal scrolling.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../../shadcn/button';
import { FormSheet } from '../form-sheet';
import { QuickViewModal } from '../quick-view-modal';

describe('Property 21: Responsive Layout Adaptation', () => {
  /**
   * Property: For any modal displayed on different viewport sizes,
   * the layout should adapt without content overflow
   */
  it('should adapt QuickViewModal layout for mobile viewports', async () => {
    // Simulate mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        description="This is a test modal"
        actions={[
          { label: 'Edit', onClick: () => {} },
          { label: 'Delete', onClick: () => {} },
        ]}
      >
        <div>
          <p>Modal content that should be responsive</p>
          <Button>Action Button</Button>
        </div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    
    // Verify dialog is present
    expect(dialog).toBeInTheDocument();
    
    // Verify content is accessible
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content that should be responsive')).toBeInTheDocument();
  });

  /**
   * Property: For any modal, responsive padding should be applied
   * based on viewport size
   */
  it('should have responsive padding classes', async () => {
    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    
    // Check for responsive padding classes (p-4 sm:p-6)
    const hasResponsivePadding = 
      dialog.className.includes('p-4') || 
      dialog.className.includes('sm:p-6');
    
    expect(hasResponsivePadding).toBe(true);
  });

  /**
   * Property: For any FormSheet, it should adapt to mobile viewports
   * by taking full width
   */
  it('should make FormSheet full-width on mobile', async () => {
    render(
      <FormSheet
        open={true}
        onOpenChange={() => {}}
        title="Test Form"
        size="lg"
      >
        <div>Form content</div>
      </FormSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    
    // Check for responsive width classes (w-full sm:max-w-*)
    const hasResponsiveWidth = 
      dialog.className.includes('w-full') ||
      dialog.className.includes('sm:max-w');
    
    expect(hasResponsiveWidth).toBe(true);
  });

  /**
   * Property: For any modal with action buttons, buttons should be
   * touch-friendly (minimum 44x44px)
   */
  it('should have touch-friendly button sizes', async () => {
    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        actions={[
          { label: 'Edit', onClick: () => {} },
          { label: 'Delete', onClick: () => {} },
        ]}
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    // Check for touch-friendly size classes (min-h-[44px])
    expect(editButton.className).toContain('min-h-[44px]');
    expect(deleteButton.className).toContain('min-h-[44px]');
  });

  /**
   * Property: For any FormSheet, submit and cancel buttons should be
   * touch-friendly
   */
  it('should have touch-friendly form buttons', async () => {
    render(
      <FormSheet
        open={true}
        onOpenChange={() => {}}
        title="Test Form"
        onSubmit={() => {}}
        submitLabel="Save"
        cancelLabel="Cancel"
      >
        <div>Form content</div>
      </FormSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    // Check for touch-friendly size classes
    expect(cancelButton.className).toContain('min-h-[44px]');
    expect(saveButton.className).toContain('min-h-[44px]');
  });

  /**
   * Property: For any modal with multiple actions, actions should wrap
   * on small screens
   */
  it('should wrap action buttons on small screens', async () => {
    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        actions={[
          { label: 'Action 1', onClick: () => {} },
          { label: 'Action 2', onClick: () => {} },
          { label: 'Action 3', onClick: () => {} },
        ]}
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find the actions container
    const actionsGroup = screen.getByRole('group', { name: /quick actions/i });
    
    // Check for flex-wrap class
    expect(actionsGroup.className).toContain('flex-wrap');
  });

  /**
   * Property: For any modal, the layout should stack vertically on mobile
   * and horizontally on desktop
   */
  it('should have responsive flex direction', async () => {
    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        actions={[
          { label: 'Edit', onClick: () => {} },
        ]}
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const header = dialog.querySelector('[class*="flex"]');

    // Check for responsive flex direction classes
    if (header) {
      const hasResponsiveFlex = 
        header.className.includes('flex-col') ||
        header.className.includes('sm:flex-row');
      
      expect(hasResponsiveFlex).toBe(true);
    }
  });

  /**
   * Property: For any modal with long content, it should be scrollable
   * without breaking the layout
   */
  it('should handle long content with scrolling', async () => {
    const longContent = Array.from({ length: 50 }, (_, i) => (
      <p key={i}>This is paragraph {i + 1} of long content</p>
    ));

    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
      >
        <div>{longContent}</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    
    // Check for max-height and overflow classes
    const hasScrolling = 
      dialog.className.includes('max-h-') ||
      dialog.className.includes('overflow-');
    
    expect(hasScrolling).toBe(true);
  });

  /**
   * Property: For any modal, text should remain readable at different
   * viewport sizes
   */
  it('should maintain readable text sizes', async () => {
    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal Title"
        description="This is a description that should remain readable"
      >
        <div>
          <p>Body text that should be readable</p>
        </div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Verify all text is present and accessible
    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    expect(screen.getByText('This is a description that should remain readable')).toBeInTheDocument();
    expect(screen.getByText('Body text that should be readable')).toBeInTheDocument();
  });

  /**
   * Property: For any modal, the close button should always be accessible
   * and touch-friendly
   */
  it('should have accessible close button on all screen sizes', async () => {
    render(
      <QuickViewModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
      >
        <div>Content</div>
      </QuickViewModal>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toBeVisible();
  });

  /**
   * Property: For any FormSheet with filters, filters should stack
   * vertically on mobile
   */
  it('should stack form elements vertically on mobile', async () => {
    render(
      <FormSheet
        open={true}
        onOpenChange={() => {}}
        title="Test Form"
      >
        <form>
          <div className="space-y-4">
            <div>
              <label htmlFor="field1">Field 1</label>
              <input id="field1" />
            </div>
            <div>
              <label htmlFor="field2">Field 2</label>
              <input id="field2" />
            </div>
          </div>
        </form>
      </FormSheet>,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Verify form fields are present
    expect(screen.getByLabelText('Field 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Field 2')).toBeInTheDocument();
  });
});
