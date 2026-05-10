const API_BASE_URL = "https://civic-backend-p2lp.onrender.com/api";

export const authApi = {
  async signInWithEmail(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in/email`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async signOut(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign-out`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Logout failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },
async getCitizens(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/citizens`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch citizens");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
  async createUser(userData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/citizens`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },
  async getCitizenById(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/citizens/${id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch citizen details");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
// Add this inside the authApi object (after other methods)
async changePassword(passwordData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Change password failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
async updateCitizen(id, userData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/citizens/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update citizen");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
async deleteCitizen(id, reason, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/citizens/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete citizen");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
async bulkDeleteCitizens(ids, reason, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/citizens/bulk-delete`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ids, reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete citizens");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
// ============= AUDIT ENDPOINTS =============

// Get Audit Statistics Overview (last 30 days)
async getAuditStats(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/audit/stats`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch audit statistics");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Get Admin Actions Audit Logs
async getAdminActionsAudit(token, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.bureauId) queryParams.append('bureauId', filters.bureauId);
    if (filters.adminId) queryParams.append('adminId', filters.adminId);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.entityType) queryParams.append('entityType', filters.entityType);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${API_BASE_URL}/admin/global/audit/admin-actions${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch admin actions audit");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
// Get Growth Statistics (Global Admin only)
async getGrowthStats(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/audit/stats/growth`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch growth statistics");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
 // ============= GLOBAL ADMIN PROFILE MANAGEMENT =============
  
  // Get global admin profile
  async getGlobalAdminProfile(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agency/profile`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch global admin profile");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Update global admin profile (name and image)
  async updateGlobalAdminProfile(profileData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/global/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update global admin profile");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

// Add inside authApi object after the getForums method
// ============= GLOBAL ANNOUNCEMENTS CRUD OPERATIONS =============

// Get Global Announcements
async getGlobalAnnouncements(token, limit = 50, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/announcements?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch global announcements");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Create Global Announcement
async createGlobalAnnouncement(announcementData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/announcements`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create global announcement");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Update Global Announcement
async updateGlobalAnnouncement(id, announcementData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/announcements/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(announcementData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update global announcement");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Delete Global Announcement
async deleteGlobalAnnouncement(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/announcements/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete global announcement");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
// Get Overview Statistics (Global Admin only)
async getOverviewStats(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/stats/overview`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch overview statistics");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Get Detailed Statistics (Global Admin only)
async getDetailedStats(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/stats/detailed`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch detailed statistics");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},
// ============= AUDIT NOTIFICATIONS ENDPOINTS =============

// Get all audit notifications
async getAuditNotifications(token, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.read) queryParams.append('read', filters.read);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${API_BASE_URL}/admin/global/audit/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch audit notifications");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Mark notification as read
async markNotificationAsRead(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/global/audit/notifications/${id}/read`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to mark notification as read");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// ============= REPORTS ENDPOINTS =============

// List all reports
async getReports(token, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${API_BASE_URL}/admin/reports${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch reports");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Resolve report
async resolveReport(id, resolveData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${id}/resolve`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(resolveData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to resolve report");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Reject report
async rejectReport(id, rejectData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${id}/reject`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(rejectData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to reject report");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// ============= SUGGESTIONS ENDPOINTS =============

// List all suggestions
async getSuggestions(token, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${API_BASE_URL}/admin/suggestions${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch suggestions");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Get suggestion by ID (Read specific message)
async getSuggestionById(id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/agency/suggestions/${id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch suggestion details");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

// Respond to suggestion
async respondToSuggestion(id, responseData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/suggestions/${id}/respond`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(responseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to respond to suggestion");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

};
// Create a separate forumApi object
export const forumApi = {
  async getForums(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/forums`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch forums");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async createForum(forumData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/forums`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(forumData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create forum");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async getForumById(id, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/forums/${id}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch forum");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async getForumPosts(forumId, params, token) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        sort: params.sort || 'created_at',
        order: params.order || 'desc'
      }).toString();

      const response = await fetch(`${API_BASE_URL}/forums/${forumId}/posts?${queryParams}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch posts");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async createForumPost(forumId, postData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/forums/${forumId}/posts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "PROFANITY_DETECTED") {
          const error = new Error(data.error || "Content contains inappropriate language");
          error.code = data.code;
          error.matchedWords = data.matchedWords;
          error.severity = data.severity;
          throw error;
        }
        throw new Error(data.error || "Failed to create post");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async updatePost(postId, postData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update post");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async deletePost(postId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async createReply(postId, content, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "LOCKED") {
          const error = new Error(data.error || "Post is locked");
          error.code = data.code;
          throw error;
        }
        throw new Error(data.error || "Failed to create reply");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async deleteReply(replyId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/replies/${replyId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete reply");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async getPostWithReplies(postId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch post");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // ADD THESE TWO METHODS:
  async updateForum(forumId, forumData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/forums/${forumId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(forumData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update forum");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  async deleteForum(forumId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/forums/${forumId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete forum");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },
};
// Add to your existing api object or create a new pollsApi object
export const pollsApi = {
  // Get all active polls (public)
  async getPolls(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/polls`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch polls");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Get poll details by ID
  async getPollById(pollId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch poll");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Create a new poll (admin only)
  async createPoll(pollData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/polls`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(pollData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create poll");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Cast a vote on a poll
  async voteOnPoll(pollId, optionIndex, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ option_index: optionIndex }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (data.code === "NOT_TARGETED") {
          const error = new Error(data.error || "You are not eligible to vote in this poll");
          error.code = data.code;
          throw error;
        } else if (data.code === "ALREADY_VOTED") {
          const error = new Error(data.error || "You have already voted in this poll");
          error.code = data.code;
          throw error;
        } else if (data.code === "EXPIRED") {
          const error = new Error(data.error || "Poll voting period has ended");
          error.code = data.code;
          throw error;
        } else if (data.code === "INVALID_OPTION") {
          const error = new Error(data.error || "Invalid option selected");
          error.code = data.code;
          throw error;
        }
        throw new Error(data.error || "Failed to vote");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Get poll results
  async getPollResults(pollId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/polls/${pollId}/results`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch results");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },
  
  // Add to pollsApi object
async updatePoll(pollId, pollData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/polls/${pollId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(pollData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update poll");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

async deletePoll(pollId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/polls/${pollId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete poll");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
},

  // ============= BUREAU CRUD OPERATIONS =============
  
  // Get all bureaus
  async getBureaus(token) {
    try {
      console.log('Fetching bureaus with token:', token); // Debug log
      const response = await fetch(`${API_BASE_URL}/admin/bureaus`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      console.log('Response status:', response.status); // Debug log
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bureaus");
      }

      console.log('Bureaus data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Get bureaus error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Get bureau by ID
  async getBureauById(id, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bureaus/${id}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch bureau");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  },

  // Create bureau
  async createBureau(bureauData, token) {
    try {
      console.log('Creating bureau with data:', bureauData); // Debug log
      const response = await fetch(`${API_BASE_URL}/admin/bureaus`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bureauData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create bureau");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error");
    }
  },

  // Update bureau
  async updateBureau(id, bureauData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bureaus/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bureauData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update bureau");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error");
    }
  },

  // Delete bureau
  async deleteBureau(id, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bureaus/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete bureau");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error");
    }
  }
};

export const agencyApi = {
  // Create Agency Head (Global Super Admin)
  async createAgencyHead(agencyHeadData, token) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/agency/create-agency-head`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(agencyHeadData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create agency head");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error");
    }
  },

 

   async getAdmin(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agency/bureaus/admins`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch admin");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error");
    }
  },
  // Update Bureau Super Admin
async updateBureauSuperAdmin(bureauId, id, updateData, token) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/agency/bureaus/${bureauId}/superadmins/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update bureau super admin");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error");
  }
},

// Delete Bureau Super Admin (Soft Delete)
async deleteBureauSuperAdmin(bureauId, id, token) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/agency/bureaus/${bureauId}/superadmins/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete bureau super admin");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error");
  }
},

};