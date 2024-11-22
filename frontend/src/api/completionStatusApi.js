import axios from 'axios';

const API_BASE_URL = 'http://localhost:8021/api/v1'; // Update this URL based on your backend setup

// Create or Update Completion Status
export const createOrUpdateStatus = async (statusData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/completion-status`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error('Error in createOrUpdateStatus:', error);
    throw error;
  }
};

// Function to get status from API
export const getStatus = async (queryParams) => {
  try {
    const response = await axios.get(
      `http://localhost:8021/api/v1/completion-status`,
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error('Error in getStatus:', error);
    throw error;
  }
};

// Function to get status from API
export const getAllStatus = async (queryParams) => {
  try {
    const response = await axios.get(
      `http://localhost:8021/api/v1/completion-status/all`,
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error('Error in getStatus:', error);
    throw error;
  }
};

export const getStatusById = async (completionStatusId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/completion-status/all/${completionStatusId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error in getById', error);
    throw error;
  }
};

// // Get Completion Status by Criteria
// export const getStatus = async (queryParams) => {
//   try {
//     const response = await axios.get(
//       `http://localhost:8021/api/v1/completion-status`,
//       { params: queryParams }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error in getStatus:', error);
//     throw error;
//   }
// };

// Update Specific Completion Status by ID
export const updateStatus = async (completionStatusId, updateData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error in updateStatus:', error);
    throw error;
  }
};

// Delete Completion Status by ID
export const deleteStatus = async (completionStatusId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/completion-status/${completionStatusId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error in deleteStatus:', error);
    throw error;
  }
};

export const delegateToIT = async (
  completionStatusId,
  itOwnerId,
  currentUserId
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/delegate-it`,
      {
        itOwnerId,
        currentUserId,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in delegateToIT:', error);
    throw error;
  }
};

// Delegate to Auditor
export const delegateToAuditor = async (
  completionStatusId,
  currentUserId
  // auditorId
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/delegate-auditor`,
      {
        currentUserId, // Ensure this is sent as expected
        // auditorId,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in delegateToAuditor:', error);
    throw error;
  }
};

// Delegate to Auditor
export const delegateToExternalAuditor = async (
  completionStatusId,
  currentUserId
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/delegate-external-auditor`,
      {
        currentUserId, // Ensure this is sent as expected
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in delegate To external Auditor:', error);
    throw error;
  }
};

// Confirm Evidence or Return Evidence
export const confirmEvidence = async (
  completionStatusId,
  feedback,
  currentUserId
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/confirm-evidence`,
      { feedback, currentUserId }
    );
    return response.data;
  } catch (error) {
    console.error('Error in confirmEvidence:', error);
    throw error;
  }
};

// Confirm Evidence or Return Evidence
export const returnEvidence = async (
  completionStatusId,
  feedback,
  currentUserId
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/return-evidence`,
      { feedback, currentUserId }
    );
    return response.data;
  } catch (error) {
    console.error('Error in confirmEvidence:', error);
    throw error;
  }
};

// Set Status to "Not Applicable (Pending Auditor Confirmation)"
export const setNotApplicableStatus = async (completionStatusId, userId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/set-not-applicable`,
      { userId }
    );
    console.log(response.data.message); // Handle success message
    return response.data.completionStatus; // Return the updated completion status
  } catch (error) {
    console.error(
      'Error setting status to Not Applicable:',
      error.response?.data?.message || error.message
    );
    throw new Error('Failed to update status');
  }
};

// Confirm Status as "Not Applicable"
export const confirmNotApplicableStatus = async (
  completionStatusId,
  userId
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/completion-status/${completionStatusId}/confirm-not-applicable`,
      { userId }
    );
    console.log(response.data.message); // Handle success message
    return response.data.completionStatus; // Return the updated completion status
  } catch (error) {
    console.error(
      'Error confirming Not Applicable status:',
      error.response?.data?.message || error.message
    );
    throw new Error('Failed to confirm status');
  }
};
