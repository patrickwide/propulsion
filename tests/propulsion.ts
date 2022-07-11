import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Propulsion } from "../target/types/propulsion";
import { expect, assert, use } from "chai";

describe("propulsion", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Propulsion as Program<Propulsion>;

  it('Send propulsionData!', async () => {
    const propulsionDataKeypair = anchor.web3.Keypair.generate();
    const user = provider.wallet;

    await program.methods.sendPropulsionData("joinedDeal", "3pXpj43Tk8QzDAoERjHE3ED7oEKLKephjnVakvkiHF8").accounts({
      propulsionData: propulsionDataKeypair.publicKey,
      author: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).signers([propulsionDataKeypair]).rpc();
    let joinedDeal = await program.account.propulsionData.fetch(propulsionDataKeypair.publicKey);

    expect(joinedDeal.category).to.equal('joinedDeal');
    expect(joinedDeal.archiveId).to.equal('3pXpj43Tk8QzDAoERjHE3ED7oEKLKephjnVakvkiHF8');

  });

});

