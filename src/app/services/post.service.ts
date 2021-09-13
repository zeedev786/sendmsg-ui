import { Injectable } from '@angular/core';
import { Post } from '../posts/post.model';
import { Msg } from '../posts/msg.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment'
const BACKEND_URL = environment.apiUrl + "/posts"
@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
 
  private postsUpdated = new Subject<Post[]>();
  public err = new BehaviorSubject<any>(null);
  constructor(
    private http: HttpClient, private router: Router
  ) { }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(first_name: string, last_name: string,phone: string,email: string, imgpath: File) {
    const postData = new FormData();
    postData.append("first_name", first_name);
    postData.append("last_name", last_name);
    postData.append("phone", phone);
    postData.append("email", email);
    postData.append("image", imgpath, first_name); 
    this.http
      .post<{ message: string; post: Post }>(
        BACKEND_URL,
        postData
      )
      .subscribe(responseData => {
        this.err.next(null)
        this.router.navigate(["/"]);


      }),
      err => {
        this.err.next(err)
      }
  }

  getPosts() {
    this.http.get<{ message: string; posts: any }>(BACKEND_URL)
      .pipe(
        map(postData => {
          return postData.posts.map(post => {
            return {
              first_name: post.first_name,
              last_name: post.last_name,
              phone: post.phone,
              email: post.email, 
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          });
        })
      )
      .subscribe(transformedPosts => {
        this.err.next(null)

        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      },
        err => {
          this.err.next(err)
        });
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string, first_name: string, last_name: string,phone: string,email: string, imagePath: string,
      creator: string;
    }>(
      BACKEND_URL +"/" + id
    );
  }

  getMyPost(id: string) {
    this.http.get<{ message: string; posts: any }>(
      BACKEND_URL + "/mypost"
    ).pipe(
      map(postData => {
        return postData.posts.map(post => {
          return {
            first_name: post.first_name,
            last_name: post.last_name,
            phone: post.phone,
            email: post.email,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator,
            otps: post.otps
          };
        });
      })
    )
      .subscribe(transformedPosts => {
        this.err.next(null)

        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      },
        err => {
          this.err.next(err)
        });
  }


  updatePost(id: string, first_name: string, last_name: string,phone: string,email: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("first_name", first_name);
      postData.append("last_name", last_name);
      postData.append("phone", phone);
      postData.append("email", email);
      postData.append("image", image, first_name);
    } else {
      postData = {
        id: id,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        email: email,
        imagePath: image,
        creator: null,
        otps: null
      };
    }
    this.http
      .put(BACKEND_URL + "/" +id, postData)
      .subscribe(response => {
        this.err.next(null)
        this.router.navigate(["/myposts"]);
      },
        err => {
          this.err.next(err)
        });
  }
  sendMsg(id: string, otpsent: string, otps: string, creator: string) {
    let postData: Msg | FormData;
      postData = {
        id: id,
        otpsent: otpsent,
        otps: otps,
        creator: null
      }; 
      console.log("postdata",postData); 
    this.http
      .put(BACKEND_URL + "/sendmsg/" +id, postData)
      .subscribe(response => {
        this.err.next(null)
        this.router.navigate(["/myposts"]);
      },
        err => {
          this.err.next(err)
        });
  }
  deletePost(postId: string) {
    this.http
      .delete(BACKEND_URL +"/"+ postId)
      .subscribe((data) => {

        this.err.next(null)
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);


      },
        e => {
          this.err.next(e)

        });

  }
}
