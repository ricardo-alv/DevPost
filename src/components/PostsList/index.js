import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Container,
  Name,
  Header,
  Avatar,
  ContentView,
  Content,
  Actions,
  LikeButton,
  Like,
  TimePost
} from './styles';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore'
import { useNavigation } from '@react-navigation/native'

export default function PostsList({ data, userId }) {
  const navigation = useNavigation();
  const [likePost, setLikePost] = useState(data?.likes)

  async function handleLikePosts(id, likes) {
    const docId = `${userId}_${id}`;

    //checar se o post ja foi curtido
    const doc = await firestore().collection('likes')
      .doc(docId).get();
    // return

    if (doc.exists) {

      // Deslike porque ja existe o like
      await firestore().collection('posts')
        .doc(id).update({
          likes: likes - 1
        })

      await firestore().collection('likes').doc(docId)
        .delete()
        .then(() => {
          setLikePost(likes - 1)
        })

      return;
    }

    //Precisar dar o like 
    await firestore().collection('likes').doc(docId)
      .set({
        postId: id,
        userId: userId
      })

    await firestore().collection('posts')
      .doc(id).update({
        likes: likes + 1
      })
      .then(() => {
        setLikePost(likes + 1)
      })

  }

  function formatTimePost() {

    const datePost = new Date(data.created.seconds * 1000);
    return formatDistance(
      new Date(),
      datePost,
      {
        locale: ptBR
      }
    );
  }

  return (
    <Container >
      <Header onPress={() => navigation.navigate("PostsUser", { title: data.autor, userId: data.userId })}>
        {data.avatarUrl ? (
          <Avatar
            source={{ uri: data.avatarUrl }}
          />
        ) : (
          <Avatar
            source={require('../../assets/avatar.png')}
          />
        )}

        <Name numberOfLines={1}>
          {data?.autor}
        </Name>
      </Header>

      <ContentView>
        <Content>{data?.content}</Content>
      </ContentView>

      <Actions>
        <LikeButton onPress={() => handleLikePosts(data.id, likePost)}>
          <Like>{likePost === 0 ? '' : likePost}</Like>
          <MaterialCommunityIcons
            name={likePost === 0 ? 'heart-plus-outline' : 'cards-heart'}
            size={20}
            color="#E52246"
          />
        </LikeButton>

        <TimePost>
          {formatTimePost()}
        </TimePost>
      </Actions>
    </Container>
  );
}