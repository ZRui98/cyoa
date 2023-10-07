export async function load({ url }) {
    let adventureName = url.searchParams.get('adventure_name');
    return { adventureName };
}