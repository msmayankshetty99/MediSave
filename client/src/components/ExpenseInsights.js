import React, { useState, useEffect } from 'react';
import './ExpenseInsights.css';

const ExpenseInsights = ({ expenses, categories }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Automatically generate insights when the component loads
  useEffect(() => {
    if (expenses && expenses.length > 0 && !insights && !loading) {
      generateInsights();
    }
  }, [expenses, insights, loading]);

  const generateInsights = async () => {
    if (!expenses || expenses.length === 0) {
      setError('No expense data available to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate category totals
      const categoryTotals = {};
      categories.forEach(cat => {
        categoryTotals[cat.id] = 0;
      });

      expenses.forEach(expense => {
        if (categoryTotals[expense.category] !== undefined) {
          categoryTotals[expense.category] += Math.round(expense.amount * 100) / 100;
        } else {
          categoryTotals['other'] += Math.round(expense.amount * 100) / 100;
        }
      });

      // Prepare data for the API
      const expenseData = {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          total: categoryTotals[cat.id] || 0
        })),
        totalExpenses: expenses.reduce((sum, exp) => sum + Math.round(exp.amount * 100) / 100, 0),
        recentExpenses: expenses.slice(0, 10).map(exp => ({
          name: exp.name,
          amount: exp.amount,
          category: exp.category,
          date: exp.date
        }))
      };

      // Call the server API
      const response = await fetch('http://localhost:5001/api/expense-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const result = await response.json();
      setInsights(result.insights);
      // Auto-expand the recommendations section when insights are loaded
      setExpandedSection('recommendations');
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="expense-insights">
      <div className="insights-header">
        <h2>AI Expense Insights</h2>
        {insights && !loading && (
          <button 
            className="generate-insights-button"
            onClick={generateInsights}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        )}
      </div>

      {error && (
        <div className="insights-error">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="insights-loading">
          <p>Analyzing your expenses...</p>
          <div className="loading-spinner"></div>
        </div>
      )}

      {insights && !loading && !error && (
        <div className="insights-content">
          {/* Collapsible sections */}
          <div className="collapsible-sections">
            {/* Recommendations section */}
            <div className="collapsible-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection('recommendations')}
              >
                <h3>
                  <span className="section-icon">✅</span>
                  Recommendations
                </h3>
                <span className="toggle-icon">
                  {expandedSection === 'recommendations' ? '−' : '+'}
                </span>
              </div>
              
              {expandedSection === 'recommendations' && (
                <div className="section-content">
                  <div className="insights-recommendations">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="recommendation-item">
                        <div className="recommendation-icon">{index + 1}</div>
                        <div className="recommendation-text">{recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis section */}
            <div className="collapsible-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection('analysis')}
              >
                <h3>
                  <span className="section-icon">📊</span>
                  Spending Analysis
                </h3>
                <span className="toggle-icon">
                  {expandedSection === 'analysis' ? '−' : '+'}
                </span>
              </div>
              
              {expandedSection === 'analysis' && (
                <div className="section-content">
                  <p className="insights-analysis">{insights.analysis}</p>
                </div>
              )}
            </div>

            {/* Summary section */}
            <div className="collapsible-section">
              <div 
                className="section-header" 
                onClick={() => toggleSection('summary')}
              >
                <h3>
                  <span className="section-icon">💰</span>
                  Potential Savings
                </h3>
                <span className="toggle-icon">
                  {expandedSection === 'summary' ? '−' : '+'}
                </span>
              </div>
              
              {expandedSection === 'summary' && (
                <div className="section-content">
                  <div className="insights-summary">
                    <p>{insights.summary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="insights-placeholder">
          <p>Automatically analyzing your expenses...</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseInsights; 