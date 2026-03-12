const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { data: campaigns, error: campaignError } = await supabase
            .from('campaigns')
            .select('id, url, status, tone, created_at')
            .order('created_at', { ascending: false })
            .limit(1);

        if (campaignError) {
            console.error('Error fetching latest campaign:', campaignError);
        } else if (campaigns && campaigns.length > 0) {
            console.log('--- LATEST CAMPAIGN ---');
            console.log('ID:', campaigns[0].id);
            console.log('Status:', campaigns[0].status);
            console.log('Tone:', campaigns[0].tone);
            console.log('Created At:', campaigns[0].created_at);
        } else {
            console.log('No campaigns found.');
        }

        const { data: assets, error: assetError } = await supabase
            .from('assets')
            .select('campaign_id, metadata')
            .order('created_at', { ascending: false })
            .limit(1);

        if (assetError) {
            console.error('Error fetching latest asset:', assetError);
        } else if (assets && assets.length > 0) {
            console.log('--- LATEST ASSET ---');
            console.log('Campaign ID:', assets[0].campaign_id);
            console.log('Metadata Tone:', assets[0].metadata?.tone);
        }
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkSchema();
