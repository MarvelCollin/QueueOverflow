use sea_orm::*;
use crate::entities::{votes, users, questions, answers};
use crate::models::vote_models::{VoteResponse, VoteCount};
use crate::error::Result;

pub struct VoteRepository {
    db: DatabaseConnection,
}

impl VoteRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_vote(
        &self,
        user_id: i32,
        target_id: i32,
        target_type: String,
        vote_type: String,
    ) -> Result<VoteResponse> {
        let txn = self.db.begin().await?;

        let existing_vote = votes::Entity::find()
            .filter(
                Condition::all()
                    .add(votes::Column::UserId.eq(user_id))
                    .add(votes::Column::TargetId.eq(target_id))
                    .add(votes::Column::TargetType.eq(target_type.clone()))
            )
            .one(&txn)
            .await?;

        match existing_vote {
            Some(existing) if existing.vote_type != vote_type => {
                let old_vote_type = existing.vote_type.clone();

                let mut vote_model: votes::ActiveModel = existing.into();
                vote_model.vote_type = Set(vote_type.clone());
                let updated = vote_model.update(&txn).await?;

                let reputation_change = self.calculate_reputation_change(
                    &old_vote_type,
                    &vote_type,
                    &target_type
                );

                self.update_content_owner_reputation(&txn, target_id, &target_type, reputation_change).await?;

                txn.commit().await?;
                Ok(self.to_response(updated))
            },
            Some(existing) => {
                txn.commit().await?;
                Ok(self.to_response(existing))
            },
            None => {
                let vote = votes::ActiveModel {
                    user_id: Set(user_id),
                    target_id: Set(target_id),
                    target_type: Set(target_type.clone()),
                    vote_type: Set(vote_type.clone()),
                    created_at: Set(chrono::Utc::now()),
                    ..Default::default()
                }.insert(&txn).await?;

                let reputation_change = self.calculate_reputation_change(
                    "",
                    &vote_type,
                    &target_type
                );

                self.update_content_owner_reputation(&txn, target_id, &target_type, reputation_change).await?;

                txn.commit().await?;
                Ok(self.to_response(vote))
            }
        }
    }

    pub async fn get_vote_count(&self, target_id: i32, target_type: &str) -> Result<VoteCount> {
        let votes = votes::Entity::find()
            .filter(
                Condition::all()
                    .add(votes::Column::TargetId.eq(target_id))
                    .add(votes::Column::TargetType.eq(target_type))
            )
            .all(&self.db)
            .await?;

        let upvotes = votes.iter().filter(|v| v.vote_type == "up").count() as i64;
        let downvotes = votes.iter().filter(|v| v.vote_type == "down").count() as i64;

        Ok(VoteCount {
            upvotes,
            downvotes,
            total: upvotes - downvotes,
        })
    }

    pub async fn get_user_vote(&self, user_id: i32, target_id: i32, target_type: &str) -> Result<Option<String>> {
        let vote = votes::Entity::find()
            .filter(
                Condition::all()
                    .add(votes::Column::UserId.eq(user_id))
                    .add(votes::Column::TargetId.eq(target_id))
                    .add(votes::Column::TargetType.eq(target_type))
            )
            .one(&self.db)
            .await?;

        Ok(vote.map(|v| v.vote_type))
    }

    fn to_response(&self, vote: votes::Model) -> VoteResponse {
        VoteResponse {
            id: vote.id,
            user_id: vote.user_id,
            vote_type: vote.vote_type,
            target_id: vote.target_id,
            target_type: vote.target_type,
            created_at: vote.created_at,
        }
    }

    fn calculate_reputation_change(&self, old_vote: &str, new_vote: &str, target_type: &str) -> i32 {
        match target_type {
            "question" => {
                match (old_vote, new_vote) {
                    ("", "up") => 5,
                    ("", "down") => -2,
                    ("up", "down") => -7,
                    ("down", "up") => 7,
                    _ => 0,
                }
            },
            "answer" => {
                match (old_vote, new_vote) {
                    ("", "up") => 10,
                    ("", "down") => -2,
                    ("up", "down") => -12,
                    ("down", "up") => 12,
                    _ => 0,
                }
            },
            _ => 0,
        }
    }

    async fn update_content_owner_reputation(
        &self,
        txn: &DatabaseTransaction,
        target_id: i32,
        target_type: &str,
        reputation_change: i32,
    ) -> Result<()> {
        let owner_id = match target_type {
            "question" => {
                questions::Entity::find_by_id(target_id)
                    .select_only()
                    .column(questions::Column::UserId)
                    .into_tuple::<i32>()
                    .one(txn)
                    .await?
            },
            "answer" => {
                answers::Entity::find_by_id(target_id)
                    .select_only()
                    .column(answers::Column::UserId)
                    .into_tuple::<i32>()
                    .one(txn)
                    .await?
            },
            _ => None,
        };

        if let Some(owner_id) = owner_id {
            let user = users::Entity::find_by_id(owner_id)
                .one(txn)
                .await?
                .ok_or_else(|| DbErr::RecordNotFound("User not found".to_string()))?;

            let mut user_model: users::ActiveModel = user.into();
            user_model.reputation = Set(user_model.reputation.unwrap() + reputation_change);
            user_model.update(txn).await?;
        }

        Ok(())
    }
}