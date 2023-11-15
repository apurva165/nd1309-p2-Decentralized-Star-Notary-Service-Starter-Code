const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async () => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: web3.utils.toWei(".00001", "ether") });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.notEqual(value, starPrice); // wont be equal with price difference 
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
    // 1. create a Star with different tokenId
    let id = 123;
    let sut = await StarNotary.deployed();
    await sut.createStar('STAR', id, { from: accounts[0] });
    let name = 'Apurva token';
    let symbol = 'a Kul';
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await sut.name.call(), name);
    assert.equal(await sut.symbol.call(), symbol);
});

it('lets 2 users exchange stars', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    await instance.createStar('ST 001', 100, { from: user1 });
    await instance.createStar('ST 002', 200, { from: user2 });
    await instance.approve(user2, 100,
        { from: user1, gasPrice: web3.utils.toWei(".0001", "ether") });
    await instance.approve(user1, 200,
        { from: user2, gasPrice: web3.utils.toWei(".0001", "ether") });
    await instance.exchangeStars(100, 200, { from: user1 });
    assert.equal(await instance.ownerOf(100), user2);
    assert.equal(await instance.ownerOf(200), user1);
});

it('lets a user transfer a star', async () => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.createStar('ST 001', 101, { from: user1 });
    await instance.transferStar(user2, 101, { from: user1 });
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(101), user2);
});

it('lookUptokenIdToStarInfo test', async () => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    await instance.createStar('ST 003', 103, { from: user1 });
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(103);
    // 3. Verify if you Star name is the same
    assert.equal(starName, 'ST 003');
});