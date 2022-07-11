use anchor_lang::prelude::*;

declare_id!("8i4YZYcxNpEZXHDYkhP2Ewv62jZVxvR193H8yb7sxqu1");

#[program]
pub mod propulsion {
    use super::*;
    pub fn send_propulsion_data(
        ctx: Context<SendPropulsionData>,
        category: String, 
        archive_id: String
    ) -> Result<()> {
        let data: &mut Account<PropulsionData> = &mut ctx.accounts.propulsion_data;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        if category.trim().is_empty() {
            return err!(Errors::CategoryIsEmpty);
        }

        if category.chars().count() > 50 {
            return err!(Errors::CategoryIsTooLong);
        }


        if archive_id.trim().is_empty() {
            return err!(Errors::ArchiveIdIsEmpty);
        }

        if archive_id.chars().count() > 50 {
            return err!(Errors::ArchiveIdIsTooLong);
        }

        data.author = *author.key;
        data.timestamp = clock.unix_timestamp;
        data.category = category;
        data.archive_id = archive_id;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendPropulsionData<'info> {
    #[account(init, payer = author, space = PropulsionData::LEN)]
    pub propulsion_data: Account<'info, PropulsionData>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PropulsionData {
    pub author: Pubkey,
    pub timestamp: i64,
    pub category: String,
    pub archive_id: String, 
}

// space 
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_CATEGORY_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_ARCHIVE_ID_LENGTH: usize = 50 * 4; // 50 chars max.

impl PropulsionData {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_CATEGORY_LENGTH // Category.
        + STRING_LENGTH_PREFIX + MAX_ARCHIVE_ID_LENGTH; // Archive_id.
}

// i still think solana is good,everything is an account, like in order for you to create a token you have to create an account to hold the token, developers are using the same idea to hold data, all accounts must be rent exempt, meaning they have to have rent for atleast 2 years, and if the user wants to delete the data they get the money held on this account back  

// errors
#[error_code]
pub enum Errors {
    #[msg("The provided category should not be empty.")]
    CategoryIsEmpty,

    #[msg("The provided category should be 50 characters long maximum.")]
    CategoryIsTooLong,

    #[msg("The provided archive id should not be empty.")]
    ArchiveIdIsEmpty,

    #[msg("The provided archive id should be 50 characters long maximum.")]
    ArchiveIdIsTooLong,
}
