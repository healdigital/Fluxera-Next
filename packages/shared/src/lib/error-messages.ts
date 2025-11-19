/**
 * Centralized error messages with clear, actionable guidance
 * Following Requirement 2.3: Display clear error messages explaining what went wrong and how to resolve it
 */

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
}

/**
 * Asset-related error messages
 */
export const AssetErrors = {
  NOT_FOUND: {
    title: 'Asset Not Found',
    description:
      'The asset you are looking for does not exist or has been deleted.',
    action:
      'Please check the asset ID and try again, or return to the assets list.',
  },
  CREATE_FAILED: {
    title: 'Failed to Create Asset',
    description:
      'We could not create the asset due to a system error. Your data has not been saved.',
    action:
      'Please verify all required fields are filled correctly and try again.',
  },
  UPDATE_FAILED: {
    title: 'Failed to Update Asset',
    description:
      'We could not save your changes to this asset. The asset remains unchanged.',
    action: 'Please check your internet connection and try again.',
  },
  DELETE_FAILED: {
    title: 'Failed to Delete Asset',
    description:
      'We could not delete this asset. It may be assigned to a user or have active licenses.',
    action:
      'Please unassign the asset and remove any licenses before deleting.',
  },
  ASSIGN_FAILED: {
    title: 'Failed to Assign Asset',
    description:
      'We could not assign this asset to the selected user. The asset remains unassigned.',
    action: 'Verify the user is a member of your organization and try again.',
  },
  UNASSIGN_FAILED: {
    title: 'Failed to Unassign Asset',
    description:
      'We could not unassign this asset. The current assignment remains active.',
    action: 'Please try again or contact support if the problem persists.',
  },
  NOT_ASSIGNED: {
    title: 'Asset Not Assigned',
    description: 'This asset is not currently assigned to any user.',
    action:
      'Please assign the asset to a user before attempting to unassign it.',
  },
  PERMISSION_DENIED: {
    title: 'Permission Denied',
    description:
      'You do not have permission to perform this action on this asset.',
    action: 'Contact your administrator to request the necessary permissions.',
  },
  LOAD_FAILED: {
    title: 'Failed to Load Assets',
    description:
      'We encountered an error while loading your assets. This may be due to a network issue.',
    action:
      'Please check your internet connection and try refreshing the page.',
  },
} as const;

/**
 * License-related error messages
 */
export const LicenseErrors = {
  NOT_FOUND: {
    title: 'License Not Found',
    description:
      'The license you are looking for does not exist or has been deleted.',
    action:
      'Please check the license ID and try again, or return to the licenses list.',
  },
  CREATE_FAILED: {
    title: 'Failed to Create License',
    description:
      'We could not create the license due to a system error. Your data has not been saved.',
    action:
      'Please verify all required fields are filled correctly and try again.',
  },
  UPDATE_FAILED: {
    title: 'Failed to Update License',
    description:
      'We could not save your changes to this license. The license remains unchanged.',
    action: 'Please check your internet connection and try again.',
  },
  DELETE_FAILED: {
    title: 'Failed to Delete License',
    description:
      'We could not delete this license. It may be assigned to users or assets.',
    action: 'Please remove all assignments before deleting the license.',
  },
  ASSIGN_TO_USER_FAILED: {
    title: 'Failed to Assign License to User',
    description:
      'We could not assign this license to the selected user. The license remains unassigned.',
    action: 'Verify the user is a member of your organization and try again.',
  },
  ASSIGN_TO_ASSET_FAILED: {
    title: 'Failed to Assign License to Asset',
    description:
      'We could not assign this license to the selected asset. The license remains unassigned.',
    action: 'Verify the asset exists and belongs to your organization.',
  },
  UNASSIGN_FAILED: {
    title: 'Failed to Unassign License',
    description:
      'We could not unassign this license. The current assignment remains active.',
    action: 'Please try again or contact support if the problem persists.',
  },
  DUPLICATE_KEY: {
    title: 'Duplicate License Key',
    description: 'A license with this key already exists in your organization.',
    action:
      'Please use a different license key or update the existing license.',
  },
  INVALID_DATES: {
    title: 'Invalid License Dates',
    description: 'The expiration date must be after the purchase date.',
    action: 'Please correct the dates and try again.',
  },
  EXPIRED: {
    title: 'License Expired',
    description: 'This license has expired and can no longer be assigned.',
    action: 'Please renew the license or use a different one.',
  },
  LOAD_FAILED: {
    title: 'Failed to Load Licenses',
    description:
      'We encountered an error while loading your licenses. This may be due to a network issue.',
    action:
      'Please check your internet connection and try refreshing the page.',
  },
} as const;

/**
 * User-related error messages
 */
export const UserErrors = {
  NOT_FOUND: {
    title: 'User Not Found',
    description:
      'The user you are looking for does not exist or has been removed from your organization.',
    action:
      'Please check the user ID and try again, or return to the users list.',
  },
  INVITE_FAILED: {
    title: 'Failed to Send Invitation',
    description:
      'We could not send the invitation email to this user. The invitation has not been created.',
    action: 'Please verify the email address is correct and try again.',
  },
  UPDATE_FAILED: {
    title: 'Failed to Update User',
    description:
      'We could not save your changes to this user profile. The profile remains unchanged.',
    action: 'Please check your internet connection and try again.',
  },
  ROLE_CHANGE_FAILED: {
    title: 'Failed to Change User Role',
    description:
      "We could not update the user's role. Their current role remains active.",
    action: 'Verify you have permission to change roles and try again.',
  },
  STATUS_CHANGE_FAILED: {
    title: 'Failed to Change User Status',
    description:
      "We could not update the user's status. Their current status remains active.",
    action: 'Please try again or contact support if the problem persists.',
  },
  SELF_DEACTIVATION: {
    title: 'Cannot Deactivate Yourself',
    description: 'You cannot deactivate your own account while logged in.',
    action: 'Please ask another administrator to deactivate your account.',
  },
  DUPLICATE_EMAIL: {
    title: 'Email Already Exists',
    description:
      'A user with this email address already exists in your organization.',
    action: 'Please use a different email address or update the existing user.',
  },
  PERMISSION_DENIED: {
    title: 'Permission Denied',
    description:
      'You do not have permission to perform this action on this user.',
    action: 'Contact your administrator to request the necessary permissions.',
  },
  LOAD_FAILED: {
    title: 'Failed to Load Users',
    description:
      'We encountered an error while loading your users. This may be due to a network issue.',
    action:
      'Please check your internet connection and try refreshing the page.',
  },
} as const;

/**
 * Dashboard-related error messages
 */
export const DashboardErrors = {
  LOAD_FAILED: {
    title: 'Failed to Load Dashboard',
    description:
      'We encountered an error while loading your dashboard data. Some widgets may not display correctly.',
    action: 'Please refresh the page to try again.',
  },
  WIDGET_CONFIG_FAILED: {
    title: 'Failed to Save Widget Configuration',
    description:
      'We could not save your dashboard widget preferences. Your changes have not been applied.',
    action: 'Please try again or contact support if the problem persists.',
  },
  DATA_FETCH_FAILED: {
    title: 'Failed to Fetch Dashboard Data',
    description:
      'We could not retrieve the latest data for your dashboard. The displayed information may be outdated.',
    action: 'Please check your internet connection and refresh the page.',
  },
} as const;

/**
 * General error messages
 */
export const GeneralErrors = {
  NETWORK_ERROR: {
    title: 'Network Error',
    description:
      'We could not connect to the server. Please check your internet connection.',
    action: 'Verify your internet connection is active and try again.',
  },
  UNAUTHORIZED: {
    title: 'Unauthorized Access',
    description:
      'You are not authorized to access this resource. You may need to log in again.',
    action:
      'Please log in and try again. If the problem persists, contact support.',
  },
  FORBIDDEN: {
    title: 'Access Forbidden',
    description: 'You do not have permission to access this resource.',
    action: 'Contact your administrator to request the necessary permissions.',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    description:
      'An unexpected error occurred on the server. Our team has been notified.',
    action:
      'Please try again in a few moments. If the problem persists, contact support.',
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    description:
      'Some of the information you provided is invalid or incomplete.',
    action: 'Please review the form and correct any highlighted errors.',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    description: 'The request took too long to complete and was cancelled.',
    action:
      'Please try again. If you have a slow connection, consider reducing the amount of data.',
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    description:
      'An unexpected error occurred. We apologize for the inconvenience.',
    action:
      'Please try again. If the problem persists, contact support with error details.',
  },
} as const;

/**
 * Get a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): ErrorMessage {
  if (error instanceof Error) {
    // Check for specific error messages
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return GeneralErrors.NETWORK_ERROR;
    }

    // Permission errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return GeneralErrors.UNAUTHORIZED;
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return GeneralErrors.FORBIDDEN;
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        action: 'Please check the URL and try again.',
      };
    }

    // Server errors
    if (message.includes('500') || message.includes('server error')) {
      return GeneralErrors.SERVER_ERROR;
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return GeneralErrors.TIMEOUT;
    }

    // Return the error message if it's descriptive enough
    if (error.message.length > 10) {
      return {
        title: 'Error',
        description: error.message,
        action: 'Please try again or contact support if the problem persists.',
      };
    }
  }

  // Default error message
  return GeneralErrors.UNKNOWN_ERROR;
}

/**
 * Format an error message for display
 */
export function formatErrorMessage(error: ErrorMessage): string {
  let message = `${error.title}: ${error.description}`;

  if (error.action) {
    message += ` ${error.action}`;
  }

  return message;
}
