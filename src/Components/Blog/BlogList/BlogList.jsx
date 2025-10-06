import React, { useEffect, useState } from "react";

import "./BlogList.css";

import BlogData from "../../../Data/BlogData";
import { Link } from "react-router-dom";
import { useBlog } from "../../../contexts/BlogContext";
import toast from "react-hot-toast";

const BlogList = () => {
  const { posts, isLoading, error, categories, fetchPosts, fetchCategories } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const params = category === 'ALL' ? {} : { category: category.toLowerCase() };
    fetchPosts(params);
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Use backend posts if available, otherwise fall back to static data
  const displayPosts = posts.length > 0 ? posts : BlogData;

  return (
    <>
      <div className="blogListSection">
        <div className="blogListHeaderContainer">
          <div className="blogListHeader">
            <h2>The Blog</h2>
            <div className="blogListHeaderCategories">
              {['ALL', 'COMPANY', 'FASHION', 'STYLE', 'TRENDS', 'BEAUTY'].map((category) => (
                <p 
                  key={category}
                  className={selectedCategory === category ? "activeCategory" : ""}
                  onClick={() => handleCategoryClick(category)}
                  style={{ cursor: 'pointer' }}
                >
                  {category}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="blogPostListContainer">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <p>Loading blog posts...</p>
            </div>
          ) : displayPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <p>No blog posts found.</p>
            </div>
          ) : (
            displayPosts.map((blogPost) => (
              <div key={blogPost._id || blogPost.id} className="blogPost">
                <div className="blogPostThumb">
                  <img src={blogPost.featuredImage || blogPost.blogThumbnail} alt="blogPost" />
                </div>
                <div className="blogPostContent">
                  <div className="blogPostContentDate">
                    <p>by {blogPost.author?.name || 'admin'}</p>
                    <p>{new Date(blogPost.createdAt || blogPost.blogDate).toLocaleDateString()}</p>
                  </div>
                  <div className="blogPostContentHeading">
                    <Link to={`/blog/${blogPost._id || blogPost.id}`} onClick={scrollToTop}>
                      {blogPost.title || blogPost.blogHeading}
                    </Link>
                  </div>
                  <div className="blogPostContentDescription">
                    <p>
                      {blogPost.excerpt || blogPost.content?.substring(0, 150) + '...' || 
                       "Midst one brought greater also morning green saying had good. Open stars day let over gathered, grass face one every light of under."}
                    </p>
                  </div>
                  <div className="blogPostContentReadMore">
                    <Link to={`/blog/${blogPost._id || blogPost.id}`} onClick={scrollToTop}>
                      Continue Reading
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="blogListShowMore" onClick={scrollToTop}>
          Show More
        </p>
      </div>
    </>
  );
};

export default BlogList;
