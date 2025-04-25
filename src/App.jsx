import { useState, useEffect } from 'react';
import { Calendar, DollarSign, PieChart, TrendingUp, Home, Filter, Save, Download, Printer } from 'lucide-react';

export default function ExpenseTracker() {
  // Default initial data
  const defaultProjects = [
    { id: 1, name: "Site A - Gurgaon sec 73" },
    { id: 2, name: "Site B - Gurgaon sec 18" },
    { id: 3, name: "Site C - Gurgaon sec 67" },
    { id: 4, name: "Site D - Noida" },
    { id: 5, name: "Site E - Jamalpur" }
  ];

  const defaultTransactions = [
    { id: 1, type: 'income', category: 'Advance Payment', amount: 25000, date: '2025-04-20', description: 'Kitchen renovation advance', projectId: 1 },
    { id: 2, type: 'income', category: 'Installment', amount: 15000, date: '2025-04-15', description: 'Second installment', projectId: 2 },
    { id: 3, type: 'expense', category: 'Materials', amount: 7500, date: '2025-04-18', description: 'Lumber and fixtures', projectId: 1 },
    { id: 4, type: 'expense', category: 'Labor', amount: 6000, date: '2025-04-22', description: 'Subcontractor payment', projectId: 2 },
    { id: 5, type: 'expense', category: 'Equipment', amount: 2000, date: '2025-04-10', description: 'Tool rental', projectId: 3 },
  ];

  // Load data from localStorage or use defaults
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('contractorProjects');
    return savedProjects ? JSON.parse(savedProjects) : defaultProjects;
  });

  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('contractorTransactions');
    return savedTransactions ? JSON.parse(savedTransactions) : defaultTransactions;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('contractorProjects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('contractorTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    date: '',
    description: '',
    projectId: 1
  });

  const [newProject, setNewProject] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    transactionType: 'all',
    projectId: 'all'
  });

  const [saveStatus, setSaveStatus] = useState('');

  // Calculate totals
  const getFilteredTransactionsByProject = (projectId) => {
    return transactions
      .filter(t => {
        if (projectId === 'all') return true;
        return t.projectId === parseInt(projectId);
      })
      .filter(t => filterByDate(t));
  };

  const totalIncome = getFilteredTransactionsByProject(filter.projectId)
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = getFilteredTransactionsByProject(filter.projectId)
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Filter transactions by date
  function filterByDate(transaction) {
    if (!filter.startDate && !filter.endDate) return true;
    
    const transactionDate = new Date(transaction.date);
    const startDate = filter.startDate ? new Date(filter.startDate) : null;
    const endDate = filter.endDate ? new Date(filter.endDate) : null;
    
    if (startDate && endDate) {
      return transactionDate >= startDate && transactionDate <= endDate;
    } else if (startDate) {
      return transactionDate >= startDate;
    } else if (endDate) {
      return transactionDate <= endDate;
    }
    
    return true;
  }

  // Add new transaction
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTransaction.category || !newTransaction.amount || !newTransaction.date || !newTransaction.projectId) {
      alert('Please fill all required fields');
      return;
    }
    
    const updatedTransactions = [
      ...transactions, 
      {
        id: Date.now(), // Use timestamp for unique ID
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        projectId: parseInt(newTransaction.projectId)
      }
    ];
    
    setTransactions(updatedTransactions);
    setNewTransaction({
      type: 'income',
      category: '',
      amount: '',
      date: '',
      description: '',
      projectId: newTransaction.projectId
    });
    
    // Show save indicator
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Add new project
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject) {
      alert('Please enter a project name');
      return;
    }
    
    const newProjectObj = {
      id: Date.now(), // Use timestamp for unique ID
      name: newProject
    };
    
    setProjects([...projects, newProjectObj]);
    setNewProject('');
    setShowAddProject(false);
    
    // Show save indicator
    setSaveStatus('Project added!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Delete transaction
  const handleDeleteTransaction = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      // Show save indicator
      setSaveStatus('Transaction deleted!');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Export data as JSON
  const handleExportData = () => {
    const data = {
      projects,
      transactions,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'contractor-finances-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Export as PDF functionality
  const generatePDF = () => {
    // Create a style element for the PDF
    const style = document.createElement('style');
    style.textContent = `
      .pdf-container { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
      .pdf-header { text-align: center; margin-bottom: 20px; }
      .pdf-title { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
      .pdf-subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
      .pdf-summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .pdf-summary-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 5px; width: 30%; }
      .pdf-label { font-size: 14px; color: #666; }
      .pdf-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
      .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .pdf-table th { background-color: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #ddd; }
      .pdf-table td { padding: 10px; border: 1px solid #ddd; }
      .pdf-income { color: #047857; }
      .pdf-expense { color: #dc2626; }
      .pdf-filters { margin-bottom: 20px; padding: 10px; background-color: #f9fafb; border-radius: 5px; }
      .pdf-footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    `;

    // Create the PDF content container
    const container = document.createElement('div');
    container.className = 'pdf-container';

    // Create header
    const header = document.createElement('div');
    header.className = 'pdf-header';
    const title = document.createElement('div');
    title.className = 'pdf-title';
    title.textContent = 'Building Contractor Expense Report';
    header.appendChild(title);

    // Add filter information
    const filterInfo = document.createElement('div');
    filterInfo.className = 'pdf-filters';
    
    let filterText = 'Filters: ';
    filterText += filter.projectId === 'all' ? 'All Projects' : `Project: ${getProjectName(parseInt(filter.projectId))}`;
    filterText += filter.transactionType === 'all' ? ', All Transactions' : 
                  filter.transactionType === 'income' ? ', Income Only' : ', Expenses Only';
    
    if (filter.startDate && filter.endDate) {
      filterText += `, Period: ${filter.startDate} to ${filter.endDate}`;
    } else if (filter.startDate) {
      filterText += `, From: ${filter.startDate}`;
    } else if (filter.endDate) {
      filterText += `, To: ${filter.endDate}`;
    }
    
    filterInfo.textContent = filterText;
    header.appendChild(filterInfo);
    
    const date = document.createElement('div');
    date.className = 'pdf-subtitle';
    date.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
    header.appendChild(date);
    
    container.appendChild(header);

    // Create summary section
    const summary = document.createElement('div');
    summary.className = 'pdf-summary';
    
    const incomeSummary = document.createElement('div');
    incomeSummary.className = 'pdf-summary-item';
    const incomeLabel = document.createElement('div');
    incomeLabel.className = 'pdf-label';
    incomeLabel.textContent = 'Total Income';
    const incomeValue = document.createElement('div');
    incomeValue.className = 'pdf-value pdf-income';
    incomeValue.textContent = `₹${totalIncome.toLocaleString()}`;
    incomeSummary.appendChild(incomeLabel);
    incomeSummary.appendChild(incomeValue);
    summary.appendChild(incomeSummary);
    
    const expenseSummary = document.createElement('div');
    expenseSummary.className = 'pdf-summary-item';
    const expenseLabel = document.createElement('div');
    expenseLabel.className = 'pdf-label';
    expenseLabel.textContent = 'Total Expenses';
    const expenseValue = document.createElement('div');
    expenseValue.className = 'pdf-value pdf-expense';
    expenseValue.textContent = `₹${totalExpense.toLocaleString()}`;
    expenseSummary.appendChild(expenseLabel);
    expenseSummary.appendChild(expenseValue);
    summary.appendChild(expenseSummary);
    
    const balanceSummary = document.createElement('div');
    balanceSummary.className = 'pdf-summary-item';
    const balanceLabel = document.createElement('div');
    balanceLabel.className = 'pdf-label';
    balanceLabel.textContent = 'Current Balance';
    const balanceValue = document.createElement('div');
    balanceValue.className = `pdf-value ${balance >= 0 ? 'pdf-income' : 'pdf-expense'}`;
    balanceValue.textContent = `₹${balance.toLocaleString()}`;
    balanceSummary.appendChild(balanceLabel);
    balanceSummary.appendChild(balanceValue);
    summary.appendChild(balanceSummary);
    
    container.appendChild(summary);

    // Add transactions table
    const transactionsTitle = document.createElement('h2');
    transactionsTitle.textContent = 'Transactions';
    container.appendChild(transactionsTitle);

    if (filteredTransactions.length > 0) {
      const table = document.createElement('table');
      table.className = 'pdf-table';
      
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const headers = ['Date', 'Project', 'Category/Source', 'Description', 'Amount'];
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      const tbody = document.createElement('tbody');
      filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(transaction.date).toLocaleDateString();
        row.appendChild(dateCell);
        
        const projectCell = document.createElement('td');
        projectCell.textContent = getProjectName(transaction.projectId);
        row.appendChild(projectCell);
        
        const categoryCell = document.createElement('td');
        categoryCell.textContent = transaction.category;
        row.appendChild(categoryCell);
        
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = transaction.description;
        row.appendChild(descriptionCell);
        
        const amountCell = document.createElement('td');
        amountCell.className = transaction.type === 'income' ? 'pdf-income' : 'pdf-expense';
        amountCell.textContent = `${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toLocaleString()}`;
        row.appendChild(amountCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      container.appendChild(table);
    } else {
      const noTransactions = document.createElement('p');
      noTransactions.textContent = 'No transactions found for the selected filters.';
      container.appendChild(noTransactions);
    }

    // Project-wise summary if showing all transactions
    if (filter.projectId === 'all') {
      const projectSummaryTitle = document.createElement('h2');
      projectSummaryTitle.textContent = 'Project-wise Summary';
      container.appendChild(projectSummaryTitle);
      
      const projectTable = document.createElement('table');
      projectTable.className = 'pdf-table';
      
      const projectThead = document.createElement('thead');
      const projectHeaderRow = document.createElement('tr');
      
      const projectHeaders = ['Project', 'Total Income', 'Total Expenses', 'Balance'];
      projectHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        projectHeaderRow.appendChild(th);
      });
      
      projectThead.appendChild(projectHeaderRow);
      projectTable.appendChild(projectThead);
      
      const projectTbody = document.createElement('tbody');
      projects.forEach(project => {
        const projectTransactions = transactions.filter(t => t.projectId === project.id && filterByDate(t));
        const projectIncome = projectTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const projectExpense = projectTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        const projectBalance = projectIncome - projectExpense;
        
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = project.name;
        row.appendChild(nameCell);
        
        const incomeCell = document.createElement('td');
        incomeCell.className = 'pdf-income';
        incomeCell.textContent = `₹${projectIncome.toLocaleString()}`;
        row.appendChild(incomeCell);
        
        const expenseCell = document.createElement('td');
        expenseCell.className = 'pdf-expense';
        expenseCell.textContent = `₹${projectExpense.toLocaleString()}`;
        row.appendChild(expenseCell);
        
        const balanceCell = document.createElement('td');
        balanceCell.className = projectBalance >= 0 ? 'pdf-income' : 'pdf-expense';
        balanceCell.textContent = `₹${projectBalance.toLocaleString()}`;
        row.appendChild(balanceCell);
        
        projectTbody.appendChild(row);
      });
      
      projectTable.appendChild(projectTbody);
      container.appendChild(projectTable);
    }

    // Add footer
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.textContent = 'Generated by Building Contractor Expense Tracker';
    container.appendChild(footer);

    // Open print dialog with this content
    const printWindow = window.open('', '_blank');
    printWindow.document.head.appendChild(style);
    printWindow.document.body.appendChild(container);
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
      setSaveStatus('PDF generated!');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 500);
  };

  // Get filtered transactions
  const filteredTransactions = transactions
    .filter(t => {
      if (filter.transactionType === 'all') return true;
      return t.type === filter.transactionType;
    })
    .filter(t => {
      if (filter.projectId === 'all') return true;
      return t.projectId === parseInt(filter.projectId);
    })
    .filter(t => filterByDate(t))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Building Contractor Expense Tracker</h1>
          <p className="text-gray-600">Manage your multiple project finances with ease</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {saveStatus && (
            <span className="text-green-600 bg-green-100 px-3 py-1 rounded-md flex items-center">
              <Save className="h-4 w-4 mr-1" />
              {saveStatus}
            </span>
          )}
          
          <button 
            onClick={handleExportData}
            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm flex items-center"
          >
            <Save className="h-4 w-4 mr-1" />
            Export Data
          </button>
        </div>
      </header>
      
      {/* Project Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Home className="h-5 w-5 text-gray-500 mr-2" />
            <label className="text-gray-700 mr-2">Project:</label>
            <select 
              name="projectId" 
              value={filter.projectId} 
              onChange={handleFilterChange}
              className="p-2 border rounded-md"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            {showAddProject ? (
              <form onSubmit={handleAddProject} className="flex items-center">
                <input 
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="New Project Name"
                  className="p-2 border rounded-md mr-2"
                />
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add
                </button>
                <button 
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddProject(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddProject(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <span className="mr-1">+</span> New Project
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <h3 className="text-sm text-gray-500">Total Income</h3>
              <p className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-bold">₹{totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <h3 className="text-sm text-gray-500">Current Balance</h3>
              <p className="text-2xl font-bold">₹{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Project</label>
              <select 
                name="projectId" 
                value={newTransaction.projectId} 
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Transaction Type</label>
              <select 
                name="type" 
                value={newTransaction.type} 
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {newTransaction.type === 'income' ? 'Income Source' : 'Expense Category'}
              </label>
              <input 
                type="text" 
                name="category" 
                value={newTransaction.category} 
                onChange={handleChange}
                placeholder={newTransaction.type === 'income' ? 'Project, client, etc.' : 'Materials, labor, equipment, etc.'}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount (₹)</label>
              <input 
                type="number" 
                name="amount" 
                value={newTransaction.amount} 
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-2 border rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                name="date" 
                value={newTransaction.date} 
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea 
                name="description" 
                value={newTransaction.description} 
                onChange={handleChange}
                placeholder="Add details about this transaction"
                className="w-full p-2 border rounded-md"
                rows="2"
              />
            </div>
            
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            >
              Add Transaction
            </button>
          </form>
        </div>
        
        {/* Transactions List */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">Transactions</h2>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-500 h-5 w-5" />
                <input 
                  type="date" 
                  name="startDate" 
                  value={filter.startDate} 
                  onChange={handleFilterChange}
                  className="p-1 border rounded-md text-sm"
                  placeholder="Start Date"
                />
                <span>to</span>
                <input 
                  type="date" 
                  name="endDate" 
                  value={filter.endDate} 
                  onChange={handleFilterChange}
                  className="p-1 border rounded-md text-sm"
                  placeholder="End Date"
                />
              </div>
              
              <select 
                name="transactionType" 
                value={filter.transactionType} 
                onChange={handleFilterChange}
                className="p-1 border rounded-md text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              
              {/* Save as PDF Button */}
              <button 
                onClick={generatePDF}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm flex items-center"
              >
                <Printer className="h-4 w-4 mr-1" />
                Save as PDF
              </button>
            </div>
          </div>
          
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Project</th>
                    <th className="py-2 px-4 text-left">{filter.transactionType === 'expense' ? 'Category' : filter.transactionType === 'income' ? 'Source' : 'Category/Source'}</th>
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-right">Amount</th>
                    <th className="py-2 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className={transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{getProjectName(transaction.projectId)}</td>
                      <td className="py-3 px-4">{transaction.category}</td>
                      <td className="py-3 px-4">{transaction.description}</td>
                      <td className={`py-3 px-4 text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found for the selected filters.
            </div>
          )}
        </div>
      </div>
      
      {/* Project-wise Summary */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project-wise Summary</h2>
          
          {/* Add a separate PDF button for project summary */}
          <button 
            onClick={generatePDF}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm flex items-center"
          >
            <Printer className="h-4 w-4 mr-1" />
            Save as PDF
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Project</th>
                <th className="py-2 px-4 text-right">Total Income</th>
                <th className="py-2 px-4 text-right">Total Expenses</th>
                <th className="py-2 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map(project => {
                const projectTransactions = transactions.filter(t => t.projectId === project.id && filterByDate(t));
                const projectIncome = projectTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0);
                const projectExpense = projectTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const projectBalance = projectIncome - projectExpense;
                
                return (
                  <tr key={project.id}>
                    <td className="py-3 px-4 font-medium">{project.name}</td>
                    <td className="py-3 px-4 text-right text-green-600">₹{projectIncome.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">₹{projectExpense.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-medium ${projectBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{projectBalance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}