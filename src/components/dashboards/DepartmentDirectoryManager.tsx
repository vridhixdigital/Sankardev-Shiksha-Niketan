import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Printer,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Users,
  GraduationCap,
  Coins,
  LayoutGrid,
  Table as TableIcon,
  X,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { DepartmentDoc } from '../../types/erp';
import { printDocument } from '../../utils/printDocument';

interface DepartmentDirectoryManagerProps {
  departments: DepartmentDoc[];
  onAddDepartment?: (dept: Partial<DepartmentDoc>) => Promise<void>;
  onUpdateDepartment?: (id: string, updates: Partial<DepartmentDoc>) => Promise<void>;
  onDeleteDepartment?: (id: string) => Promise<void>;
}

const DEFAULT_DEPT_FORM = {
  departmentName: '',
  departmentCode: 'SCI-05',
  hodName: '',
  facultyCount: 10,
  studentEnrolled: 150,
  buildingBlock: 'Brahmaputra Academic Block',
  budgetAllocation: 1000000,
  status: 'active' as 'active' | 'restructuring' | 'inactive',
  description: '',
};

export const DepartmentDirectoryManager: React.FC<DepartmentDirectoryManagerProps> = ({
  departments,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals & Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_DEPT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDeptDetail, setSelectedDeptDetail] = useState<DepartmentDoc | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalDepts = departments.length;
    const totalFaculty = departments.reduce((acc, d) => acc + (d.facultyCount || 0), 0);
    const totalStudents = departments.reduce((acc, d) => acc + (d.studentEnrolled || 0), 0);
    const totalBudget = departments.reduce((acc, d) => acc + (d.budgetAllocation || 0), 0);
    return { totalDepts, totalFaculty, totalStudents, totalBudget };
  }, [departments]);

  // Filtered List
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        d.departmentName.toLowerCase().includes(q) ||
        d.departmentCode.toLowerCase().includes(q) ||
        d.hodName.toLowerCase().includes(q) ||
        d.buildingBlock.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [departments, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setEditingDeptId(null);
    setFormData(DEFAULT_DEPT_FORM);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentDoc) => {
    setEditingDeptId(dept.id);
    setFormData({
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      hodName: dept.hodName,
      facultyCount: dept.facultyCount,
      studentEnrolled: dept.studentEnrolled,
      buildingBlock: dept.buildingBlock,
      budgetAllocation: dept.budgetAllocation,
      status: dept.status,
      description: dept.description,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentName.trim() || !formData.hodName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingDeptId && onUpdateDepartment) {
        await onUpdateDepartment(editingDeptId, formData);
      } else if (!editingDeptId && onAddDepartment) {
        await onAddDepartment(formData);
      }
      setIsFormModalOpen(false);
      setEditingDeptId(null);
      setFormData(DEFAULT_DEPT_FORM);
    } catch (err) {
      console.error('Department save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmDept || !onDeleteDepartment) return;
    setIsDeleting(true);
    try {
      await onDeleteDepartment(deleteConfirmDept.id);
      setDeleteConfirmDept(null);
    } catch (err) {
      console.error('Department delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Metric Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Institutional Governance · Department Management System</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-950">
            Academic &amp; Operational Departments Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[75ch]">
            Real-time CRUD management for Sankardev Shishu Vidya Niketan departments, faculty headcounts, student enrollments, and annual budgetary allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              printDocument({
                title: 'SSN_Gohpur_Department_Directory_Master_Report',
                orientation: 'landscape',
              })
            }
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Department</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Departments</div>
            <div className="text-2xl font-display font-bold text-slate-950 mt-1">{metrics.totalDepts}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">All active &amp; functional</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Faculty Members</div>
            <div className="text-2xl font-display font-bold text-slate-950 mt-1">{metrics.totalFaculty}</div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">Qualified educators</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Students Enrolled</div>
            <div className="text-2xl font-display font-bold text-slate-950 mt-1">{metrics.totalStudents.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Compulsory residency scholars</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Budget Allocation</div>
            <div className="text-2xl font-display font-bold text-slate-950 mt-1">₹{(metrics.totalBudget / 100000).toFixed(2)} Lakhs</div>
            <div className="text-[11px] text-indigo-700 mt-0.5 font-medium">Session 2026–27 grant</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-800">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Search Controls */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by department name, code, HOD or building..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-800"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="restructuring">Restructuring</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content: Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-900 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                      {dept.departmentCode}
                    </span>
                    <h3 className="text-base font-display font-bold text-slate-950 mt-1.5">
                      {dept.departmentName}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                    dept.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : dept.status === 'restructuring'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    {dept.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {dept.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Head of Dept (HOD):</span>
                    <span className="font-bold text-slate-900">{dept.hodName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Faculty Headcount:</span>
                    <span className="font-mono font-semibold text-blue-900">{dept.facultyCount} Educators</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Students Enrolled:</span>
                    <span className="font-mono font-semibold text-slate-900">{dept.studentEnrolled} Scholars</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Building / Location:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">{dept.buildingBlock}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
                    <span className="text-slate-500 font-semibold">Annual Budget:</span>
                    <span className="font-mono font-bold text-emerald-800">₹{dept.budgetAllocation.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeptDetail(dept)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 transition-colors cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmDept(dept)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">HOD Name</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Building Location</th>
                  <th className="py-3 px-4">Budget (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{dept.departmentCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-950">{dept.departmentName}</td>
                    <td className="py-3 px-4 text-slate-700">{dept.hodName}</td>
                    <td className="py-3 px-4 font-mono">{dept.facultyCount}</td>
                    <td className="py-3 px-4 font-mono">{dept.studentEnrolled}</td>
                    <td className="py-3 px-4 text-slate-600">{dept.buildingBlock}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">₹{dept.budgetAllocation.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        dept.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDeptDetail(dept)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 rounded bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmDept(dept)}
                          className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDepartments.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
          No departments matching current search or status filter.
        </div>
      )}

      {/* ADD / EDIT DEPARTMENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-900" />
                  {editingDeptId ? 'Edit Department Record' : 'Add New Academic / Operational Department'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure department title, code, HOD leader, headcount, and budget allocation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    placeholder="e.g. Department of Science & Labs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.departmentCode}
                    onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SCI-01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Head of Department (HOD) *</label>
                  <input
                    type="text"
                    required
                    value={formData.hodName}
                    onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                    placeholder="e.g. Senior Faculty / HOD Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building / Block Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.buildingBlock}
                    onChange={(e) => setFormData({ ...formData, buildingBlock: e.target.value })}
                    placeholder="e.g. Brahmaputra Academic Block"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faculty Headcount</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.facultyCount}
                    onChange={(e) => setFormData({ ...formData, facultyCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Students Enrolled</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.studentEnrolled}
                    onChange={(e) => setFormData({ ...formData, studentEnrolled: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="restructuring">Restructuring</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Annual Budget Allocation (₹)</label>
                <input
                  type="number"
                  step={10000}
                  value={formData.budgetAllocation}
                  onChange={(e) => setFormData({ ...formData, budgetAllocation: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description &amp; Operational Scope</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail academic programs, labs, and administrative responsibilities..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingDeptId ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT DEPARTMENT DETAIL MODAL */}
      {selectedDeptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-900 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                  {selectedDeptDetail.departmentCode}
                </span>
                <h3 className="text-xl font-display font-bold text-slate-950 mt-1">
                  {selectedDeptDetail.departmentName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeptDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div><strong>HOD:</strong> {selectedDeptDetail.hodName}</div>
                <div><strong>Location:</strong> {selectedDeptDetail.buildingBlock}</div>
                <div><strong>Status:</strong> <span className="uppercase font-bold text-blue-900">{selectedDeptDetail.status}</span></div>
                <div><strong>Description:</strong> {selectedDeptDetail.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <div className="text-slate-500">Faculty Members</div>
                  <div className="text-lg font-bold text-blue-950 font-mono mt-0.5">{selectedDeptDetail.facultyCount}</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-slate-500">Students Enrolled</div>
                  <div className="text-lg font-bold text-emerald-950 font-mono mt-0.5">{selectedDeptDetail.studentEnrolled}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Annual Budget Allocation</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">₹{selectedDeptDetail.budgetAllocation.toLocaleString('en-IN')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const d = selectedDeptDetail;
                    setSelectedDeptDetail(null);
                    handleOpenEdit(d);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Edit Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-950">Confirm Permanent Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteConfirmDept.departmentName} ({deleteConfirmDept.departmentCode})</strong>? This action cannot be undone.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDept(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
