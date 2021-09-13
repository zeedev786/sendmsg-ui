import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Post } from '../post.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { PostService } from '../../services/post.service';
import { ProfileService } from 'src/app/services/profile.service';


@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  postdate: Date
  fetchedDate: Date
  form: FormGroup;
  isLoading: boolean = false
  imagePreview: string
  post: Post;
  btntext: string;
  inSendMsg: boolean = false;
  private mode = "create";
  private postId: string;
  constructor(
    private ps: PostService,
    public route: ActivatedRoute,
    public profileService:ProfileService  ,
    private router: Router,) { }

  ngOnInit(): void {
    this.checkProfileCreated()
    this.btntext = "save contact"
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(window.location.href.includes("sendmsg")){
        this.mode = "sendmsg";
        this.postId = paramMap.get("postId");
        this.getPostById(this.postId);
        this.btntext = "Send message"
        this.inSendMsg = true;

      } else {
        if (paramMap.has("postId")) { 
          this.mode = "edit";
          this.postId = paramMap.get("postId");
          this.getPostById(this.postId) 
          this.btntext = "Update Contact"
        this.inSendMsg = false;

        }
        else {
          this.mode = "create"; 
          this.postId = null;
        this.inSendMsg = false;
        this.btntext = "Save Contact"
        }
      }
    })
    this.createForm()
  }

  getPostById(id) {
    this.isLoading=true
    this.ps.getPost(id).subscribe(postData => {
    
      this.post = {
        id: postData._id,
        first_name: postData.first_name,
        last_name: postData.last_name,
        phone: postData.phone,
        email: postData.email, 
        imagePath: postData.imagePath,
        creator: postData.creator,
        otps: null
      };
      this.imagePreview = postData.imagePath
      this.form.setValue({
        first_name: this.post.first_name,
        last_name: this.post.last_name,
        phone: this.post.phone,
        email: this.post.email, 
        image: this.post.imagePath, 
      });  
      
      this.post.otps = String(Math.floor(100000 + Math.random() * 900000)); 
      this.isLoading = false;
    });

  } 

  createForm() {
    this.form = new FormGroup({
      first_name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      last_name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      phone: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(9)]
      }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }), 
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    this.postdate = new Date()
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.ps.addPost(
        this.form.value.first_name,
        this.form.value.last_name,
        this.form.value.phone,
        this.form.value.email,
        this.form.value.image
      );
    } else if(this.mode === "sendmsg"){
      this.ps.sendMsg(
        this.postId,
        "true",
        this.post.otps,
        this.form.value.creator
      );
    }
    else {
      this.ps.updatePost(
        this.postId,
        this.form.value.first_name,
        this.form.value.last_name,
        this.form.value.phone,
        this.form.value.email,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  checkProfileCreated(){
    this.profileService.getProfileByCreatorId().subscribe(profile => {
      if(!profile){
        this.router.navigate(["/profile"])
      }
    },e=>{
      this.router.navigate(["/profile"])
    })
  }
}


