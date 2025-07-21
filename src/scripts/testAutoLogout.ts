// Test script for auto logout functionality
// Run this in browser console to test

const testAutoLogout = () => {
  console.log('Testing auto logout functionality...');

  // Set last activity to 14 minutes ago (should trigger warning)
  const fourteenMinutesAgo = Date.now() - 14 * 60 * 1000;
  localStorage.setItem('last_activity', fourteenMinutesAgo.toString());

  // Simulate user activity
  const simulateActivity = () => {
    localStorage.setItem('last_activity', Date.now().toString());
    console.log('Activity simulated, timer reset');
  };

  // Test functions
  window.testAutoLogout = {
    simulateActivity,
    setInactiveTime: (minutes: number) => {
      const timeAgo = Date.now() - minutes * 60 * 1000;
      localStorage.setItem('last_activity', timeAgo.toString());
      console.log(`Set inactive time to ${minutes} minutes ago`);
    },
    checkCurrentActivity: () => {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity) {
        const timeDiff = Date.now() - parseInt(lastActivity);
        const minutesDiff = Math.floor(timeDiff / (60 * 1000));
        console.log(`Last activity: ${minutesDiff} minutes ago`);
        return minutesDiff;
      }
      console.log('No activity recorded');
      return null;
    },
  };

  console.log('Test functions available:');
  console.log('- window.testAutoLogout.simulateActivity()');
  console.log('- window.testAutoLogout.setInactiveTime(minutes)');
  console.log('- window.testAutoLogout.checkCurrentActivity()');
};

// Run test
testAutoLogout();
