async function testCreateSet() {
    try {
        const response = await fetch('http://localhost:8080/api/flashcard-sets', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer teacher-token-123',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Integration Test Set',
                description: 'Testing bypass from node-fetch',
                visibility: 'PUBLIC'
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('SUCCESS:', data);
        } else {
            console.error('FAILURE:', response.status, data);
        }
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

testCreateSet();
