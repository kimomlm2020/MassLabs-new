import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AddUser from './AddUser';
import { 
  Users as UsersIcon,
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Ban, 
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Users.scss';

const Users = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [ordersData, setOrdersData] = useState({}); // Store orders data by userId

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  // Fetch all orders to calculate user order stats
  const fetchOrdersData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/user/admin/orders`,
        { headers: { token } }
      );
      
      if (response.data.success && response.data.orders) {
        // Calculate order stats per user
        const userOrdersMap = {};
        
        response.data.orders.forEach(order => {
          const userId = order.userId || order.user?._id;
          if (!userId) return;
          
          if (!userOrdersMap[userId]) {
            userOrdersMap[userId] = {
              count: 0,
              totalSpent: 0
            };
          }
          
          userOrdersMap[userId].count += 1;
          userOrdersMap[userId].totalSpent += order.amount || 0;
        });
        
        setOrdersData(userOrdersMap);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      // Don't show toast here, users can still load without order data
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/user/list`,
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        // First fetch orders data
        await fetchOrdersData();
        
        const formattedUsers = response.data.users.map(user => {
          const userId = user._id;
          const orderStats = ordersData[userId] || { count: 0, totalSpent: 0 };
          
          return {
            id: userId,
            name: user.name,
            email: user.email,
            phone: user.phone || 'N/A',
            role: user.role || 'customer',
            status: user.status || 'active',
            avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            joinedDate: user.createdAt || user.date,
            lastActive: user.lastActive || user.updatedAt,
            orders: orderStats.count, // Real order count
            totalSpent: orderStats.totalSpent // Real total spent
          };
        });
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Refresh users when ordersData changes
  useEffect(() => {
    if (Object.keys(ordersData).length > 0 && users.length > 0) {
      const updatedUsers = users.map(user => {
        const orderStats = ordersData[user.id] || { count: 0, totalSpent: 0 };
        return {
          ...user,
          orders: orderStats.count,
          totalSpent: orderStats.totalSpent
        };
      });
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    }
  }, [ordersData]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let result = users;

    if (searchQuery) {
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, users]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await axios.post(
          `${backendUrl}/api/user/delete`,
          { userId: userToDelete.id },
          { headers: { token } }
        );
        
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      } finally {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.post(
        `${backendUrl}/api/user/status`,
        { userId, status: newStatus },
        { headers: { token } }
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'moderator': return <UserCheck className="w-4 h-4 text-blue-600" />;
      default: return <UsersIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const stats = [
    { title: 'Total Users', value: users.length, icon: UsersIcon, trend: '+12%' },
    { title: 'Active Users', value: users.filter(u => u.status === 'active').length, icon: UserCheck, trend: '+5%' },
    { title: 'New This Month', value: users.filter(u => new Date(u.joinedDate).getMonth() === new Date().getMonth()).length, icon: UserPlus, trend: '+8%' },
    { title: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, trend: '0%' }
  ];

  if (isLoading || loading) {
    return (
      <div className="users-page">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="header-title">
          <h1>User Management</h1>
          <p>Manage your platform users and their permissions</p>
        </div>
    <button className="btn-add-user" onClick={() => navigate('/admin/AddUser')}>
          <UserPlus size={20} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className={`stat-trend ${stat.trend.startsWith('-') ? 'negative' : ''}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filters-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn-filter" onClick={fetchUsers}>
              <Filter size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>
                    <div className="user-cell">
                      <img src={user.avatar} alt={user.name} className="user-avatar" />
                      <div className="user-info">
                        <p className="user-name">{user.name}</p>
                        <p className="user-id">ID: #{user.id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="role-cell">
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="orders-cell">
                      <div className="orders-header">
                        <ShoppingBag size={14} className="orders-icon" />
                        <p className="orders-count">{user.orders} orders</p>
                      </div>
                      <p className="orders-amount">${user.totalSpent.toFixed(2)}</p>
                      {user.orders > 0 && (
                        <button 
                          className="btn-view-orders"
                          onClick={() => navigate(`/admin/orders?userId=${user.id}`)}
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{new Date(user.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-action btn-edit" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <Edit2 size={18} />
                      </button>
                      {user.status === 'active' ? (
                        <button className="btn-action btn-ban" onClick={() => handleStatusChange(user.id, 'banned')}>
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button className="btn-action btn-activate" onClick={() => handleStatusChange(user.id, 'active')}>
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button className="btn-action btn-delete" onClick={() => handleDeleteClick(user)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards">
          {currentUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="card-header">
                <div className="card-user">
                  <img src={user.avatar} alt={user.name} />
                  <div className="card-user-info">
                    <h4>{user.name}</h4>
                    <span>ID: #{user.id.slice(-8)}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="card-checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </div>
              <div className="card-details">
                <div className="card-detail">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="card-detail">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
                <div className="card-detail">
                  <ShoppingBag size={16} />
                  <span>{user.orders} orders (${user.totalSpent.toFixed(2)})</span>
                </div>
                <div className="card-detail">
                  <Calendar size={16} />
                  <span>{new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="card-footer">
                <span className={`card-status status-${user.status}`}>
                  {user.status}
                </span>
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => navigate(`/admin/users/${user.id}`)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteClick(user)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <p className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="pagination-controls">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} users selected</span>
          <div className="bulk-buttons">
            <button className="btn-activate">Activate</button>
            <button className="btn-ban">Ban</button>
            <button className="btn-clear" onClick={() => setSelectedUsers([])}>Clear</button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <span className="highlight">{userToDelete?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-delete" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;