import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Propulsion } from "../target/types/propulsion";
import { expect, assert, use } from "chai";

describe("propulsion", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Propulsion as Program<Propulsion>;

  it('setup tweet platform!', async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = provider.wallet;

    await program.methods.setupPlatform().accounts({
      tweet: tweetKeypair.publicKey,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).signers([tweetKeypair]).rpc();

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');
  });

  it("Write tweet", async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = provider.wallet;

    await program.methods.setupPlatform().accounts({
      tweet: tweetKeypair.publicKey,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).signers([tweetKeypair]).rpc();

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');

    await program.methods.writeTweet("Hello world!", user.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("Hello world!");
    expect(tweet.creator.toString()).to.equal(user.publicKey.toString());
  });

  it("Should like tweet up no more than 5 times", async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = provider.wallet;

    await program.methods.setupPlatform().accounts({
      tweet: tweetKeypair.publicKey,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).signers([tweetKeypair]).rpc();

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("");

    await program.methods.writeTweet("Hello world!", user.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("Hello world!");
    expect(tweet.creator.toString()).to.equal(user.publicKey.toString());

    await program.methods.likeTweet(user.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(1);

    expect(tweet.peopleWhoLiked[0].toString()).to.equal(user.publicKey.toString());

    try {
      await program.methods.likeTweet(user.publicKey).accounts({
        tweet: tweetKeypair.publicKey,
      }).signers([]).rpc();

      assert.ok(false);
    } catch (error) {
      const expectedError = "User has already liked the tweet";
      assert.equal(error.error.errorMessage, expectedError);
    }

    const secondUser = anchor.web3.Keypair.generate();
    await program.methods.likeTweet(secondUser.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(2);
    expect(tweet.peopleWhoLiked[1].toString()).to.equal(secondUser.publicKey.toString());

    const thirdUser = anchor.web3.Keypair.generate();
    await program.methods.likeTweet(thirdUser.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(3);
    expect(tweet.peopleWhoLiked[2].toString()).to.equal(thirdUser.publicKey.toString());


    const fourthUser = anchor.web3.Keypair.generate();
    await program.methods.likeTweet(fourthUser.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(4);
    expect(tweet.peopleWhoLiked[3].toString()).to.equal(fourthUser.publicKey.toString());


    const fifthUser = anchor.web3.Keypair.generate();
    await program.methods.likeTweet(fifthUser.publicKey).accounts({
      tweet: tweetKeypair.publicKey,
    }).signers([]).rpc();

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(5);
    expect(tweet.peopleWhoLiked[4].toString()).to.equal(fifthUser.publicKey.toString());


    const sixthUser = anchor.web3.Keypair.generate();
    try {
      await program.methods.likeTweet(sixthUser.publicKey).accounts({
        tweet: tweetKeypair.publicKey,
      }).signers([]).rpc();

      assert.ok(false);
    } catch (error) {
      const expectedError = "Cannot receive more than 5 likes";
      assert.equal(error.error.errorMessage, expectedError);
    }
  });

  it("should not allow writting an empty message", async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = provider.wallet;

    await program.methods.setupPlatform().accounts({
      tweet: tweetKeypair.publicKey,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).signers([tweetKeypair]).rpc();

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');

    try {
      await program.methods.writeTweet('', user.publicKey).accounts({
        tweet: tweetKeypair.publicKey,
      }).signers([]).rpc();

      assert.ok(false);
    } catch (error) {
      const expectedError = "Message cannot be empty";
      assert.equal(error.error.errorMessage, expectedError);
    }
  });

});
