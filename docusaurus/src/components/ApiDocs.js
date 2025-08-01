import React, { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

export default function ApiDocs() {
  const history = useHistory();
  
  useEffect(() => {
    // Fetch the pre-generated API docs JSON
    fetch('/api-docs.json')
      .then(response => response.json())
      .then(data => {
        // Return JSON response
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // For development, log the URL
        console.log('API Docs available at:', url);
        
        // Redirect to home after serving
        setTimeout(() => {
          history.push('/');
        }, 100);
      })
      .catch(error => {
        console.error('Error fetching API docs:', error);
      });
  }, [history]);
  
  return null;
}